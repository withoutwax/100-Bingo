import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  Timestamp, 
  runTransaction,
  limit,
  increment,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "./config";
import { RoomDoc, PlayerDoc, RoomStatus } from "./types";
import { getPersistentPlayerId } from "../utils/identity";

export const signIn = async () => {
  return { uid: getPersistentPlayerId() };
};

export const createRoom = async (
  nickname: string, 
  roomName: string, 
  gridSize: number = 5,
  password?: string | null
): Promise<string> => {
  const user = await signIn();
  const roomRef = doc(collection(db, "rooms"));
  const roomId = roomRef.id;

  const roomData: RoomDoc = {
    roomId,
    hostId: user.uid,
    roomName,
    password: password || null,
    gridSize,
    playerCount: 1,
    winPattern: "standard",
    status: "waiting",
    turnIndex: 0,
    calledNumbers: [],
    createdAt: Timestamp.now(),
  };

  await setDoc(roomRef, roomData);

  const playerRef = doc(db, `rooms/${roomId}/players`, user.uid);
  const playerData: PlayerDoc = {
    playerId: user.uid,
    nickname,
    isReady: false,
    board: [],
    joinedAt: Timestamp.now(),
  };

  await setDoc(playerRef, playerData);

  return roomId;
};

export const joinRoom = async (roomId: string, nickname: string, password?: string) => {
  const user = await signIn();
  const roomRef = doc(db, "rooms", roomId);
  const playerRef = doc(db, `rooms/${roomId}/players`, user.uid);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");

    const roomData = roomSnap.data() as RoomDoc;
    
    // Check password if required
    if (roomData.password && roomData.password !== password) {
      throw new Error("Invalid room password");
    }

    // Check if player already exists (rejoining)
    const playerSnap = await transaction.get(playerRef);
    
    const playerData: PlayerDoc = {
      playerId: user.uid,
      nickname,
      isReady: false,
      board: [],
      joinedAt: Timestamp.now(),
    };

    transaction.set(playerRef, playerData);

    // Only increment playerCount if it's a new player joining
    if (!playerSnap.exists()) {
      transaction.update(roomRef, { 
        playerCount: increment(1) 
      });
    }
  });
};

export const getWaitingRooms = async (): Promise<RoomDoc[]> => {
  const roomsRef = collection(db, "rooms");
  // Filter for rooms that are waiting. Removing playerCount > 0 to simplify query and avoid index requirement.
  const q = query(roomsRef, where("status", "==", "waiting"));
  const querySnapshot = await getDocs(q);
  
  const rooms = querySnapshot.docs
    .map(doc => ({ ...doc.data(), roomId: doc.id } as RoomDoc))
    .filter(room => room.playerCount > 0); // Filter in-memory
  
  // Sort in-memory to avoid composite index requirement
  return rooms.sort((a, b) => {
    const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
    const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
};

export const subscribeToWaitingRooms = (callback: (rooms: RoomDoc[]) => void) => {
  const roomsRef = collection(db, "rooms");
  const q = query(roomsRef, where("status", "==", "waiting"));
  
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs
      .map(doc => ({ ...doc.data(), roomId: doc.id } as RoomDoc))
      .filter(room => room.playerCount > 0)
      .sort((a, b) => {
        const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    callback(rooms);
  });
};

export const updatePlayerBoard = async (roomId: string, playerId: string, board: number[]) => {
  const playerRef = doc(db, `rooms/${roomId}/players`, playerId);
  await setDoc(playerRef, { board, isReady: true }, { merge: true });
};

export const updateRoomStatus = async (roomId: string, status: RoomStatus) => {
  const roomRef = doc(db, "rooms", roomId);
  await setDoc(roomRef, { status }, { merge: true });
};

export const selectNumber = async (roomId: string, number: number, playerCount: number) => {
  const roomRef = doc(db, "rooms", roomId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");

    const roomData = roomSnap.data() as RoomDoc;
    const calledNumbers = roomData.calledNumbers || [];
    
    if (calledNumbers.includes(number)) return;

    const nextTurnIndex = (roomData.turnIndex + 1) % playerCount;

    transaction.update(roomRef, {
      calledNumbers: [...calledNumbers, number],
      turnIndex: nextTurnIndex
    });
  });
};

export const getRoomPlayers = async (roomId: string): Promise<PlayerDoc[]> => {
  const playersRef = collection(db, "rooms", roomId, "players");
  const q = query(playersRef, orderBy("joinedAt", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), playerId: doc.id } as PlayerDoc));
};

export const leaveRoomSimple = async (roomId: string, playerId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  const playerRef = doc(db, `rooms/${roomId}/players`, playerId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    const playerSnap = await transaction.get(playerRef);

    if (!playerSnap.exists()) return; // Player already left

    // 1. Delete the player
    transaction.delete(playerRef);

    if (roomSnap.exists()) {
      const roomData = roomSnap.data() as RoomDoc;
      const newPlayerCount = Math.max(0, roomData.playerCount - 1);

      if (newPlayerCount === 0) {
        // 2. No players left, delete the room
        transaction.delete(roomRef);
      } else {
        // 3. Decrement player count
        const updateData: any = { playerCount: newPlayerCount };

        // 4. Reassign host if necessary
        if (roomData.hostId === playerId) {
          // Note: In a transaction, we can't easily query the next player.
          // For simplicity, we'll mark it for reassignment or just let the 
          // next joinRoom/onSnapshot handle the UI logic.
          // A better way is to fetch the next player outside or accept it as param.
          // For now, let's just decrement. The next player in the list becomes host in UI.
        }
        
        transaction.update(roomRef, updateData);
      }
    }
  });
};
