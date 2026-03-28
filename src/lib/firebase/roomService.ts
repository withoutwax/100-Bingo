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
  limit
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
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDocs(query(collection(db, "rooms"), where("roomId", "==", roomId), limit(1)));
  
  if (roomSnap.empty) throw new Error("Room not found");
  
  const roomData = roomSnap.docs[0].data() as RoomDoc;
  
  if (roomData.password && roomData.password !== password) {
    throw new Error("Invalid room password");
  }

  const user = await signIn();
  const playerRef = doc(db, `rooms/${roomId}/players`, user.uid);
  
  const playerData: PlayerDoc = {
    playerId: user.uid,
    nickname,
    isReady: false,
    board: [],
    joinedAt: Timestamp.now(),
  };

  await setDoc(playerRef, playerData);
};

export const getWaitingRooms = async (): Promise<RoomDoc[]> => {
  const roomsRef = collection(db, "rooms");
  const q = query(roomsRef, where("status", "==", "waiting"));
  const querySnapshot = await getDocs(q);
  
  const rooms = querySnapshot.docs.map(doc => ({ ...doc.data(), roomId: doc.id } as RoomDoc));
  
  // Sort in-memory to avoid composite index requirement
  return rooms.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
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

  // 1. Delete the player
  await deleteDoc(playerRef);

  // 2. Fetch remaining players to check room status
  const playersRef = collection(db, "rooms", roomId, "players");
  const q = query(playersRef, orderBy("joinedAt", "asc"), limit(1));
  const playersSnap = await getDocs(q);

  if (playersSnap.empty) {
    // No players left, delete the room
    await deleteDoc(roomRef);
  } else {
    // Check if the departing player was the host
    const roomPlayers = await getDocs(query(collection(db, "rooms"), where("roomId", "==", roomId), limit(1)));
    const roomSnap = roomPlayers.docs[0];
    
    if (roomSnap && roomSnap.data().hostId === playerId) {
      // Reassign host to the first player in the list
      const nextHost = playersSnap.docs[0].id;
      await setDoc(roomRef, { hostId: nextHost }, { merge: true });
    }
  }
};
