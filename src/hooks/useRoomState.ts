import { useEffect, useState } from "react";
import { doc, collection, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { RoomDoc, PlayerDoc } from "../lib/firebase/types";

export function useRoomState(roomId: string | null) {
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [players, setPlayers] = useState<PlayerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Listen to Room Document
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribeRoom = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom({ ...snapshot.data(), roomId: snapshot.id } as RoomDoc);
        } else {
          setError("Room not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to room:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // 2. Listen to Players Sub-collection
    const playersRef = collection(db, "rooms", roomId, "players");
    const q = query(playersRef, orderBy("joinedAt", "asc"));
    const unsubscribePlayers = onSnapshot(
      q,
      (snapshot) => {
        const playersData = snapshot.docs.map(doc => ({
          ...doc.data(),
          playerId: doc.id
        } as PlayerDoc));
        setPlayers(playersData);
      },
      (err) => {
        console.error("Error listening to players:", err);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribePlayers();
    };
  }, [roomId]);

  const toggleReady = async (playerId: string, isReady: boolean) => {
    if (!roomId) return;
    const playerRef = doc(db, `rooms/${roomId}/players`, playerId);
    await updateDoc(playerRef, { isReady });
  };

  return { room, players, loading, error, toggleReady };
}
