"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lobby from "../components/Lobby";
import SetupBoard from "../components/SetupBoard";
import GameBoard from "../components/GameBoard";
import { GamePhase } from "../types";
import { useRoomState } from "../hooks/useRoomState";
import { signIn, leaveRoomSimple } from "../lib/firebase/roomService";

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [board, setBoard] = useState<number[]>([]);
  
  const { room, players, loading, error } = useRoomState(roomId);

  useEffect(() => {
    signIn().then((user) => {
      setPlayerId(user.uid);
    });
  }, []);

  const handleRoomJoined = (id: string, pid: string) => {
    setRoomId(id);
    setPlayerId(pid);
  };

  const handleLeaveRoom = async () => {
    if (roomId && playerId) {
      await leaveRoomSimple(roomId, playerId);
      setRoomId(null);
      setBoard([]);
    }
  };

  const handleBoardReady = (finalBoard: number[]) => {
    setBoard(finalBoard);
  };

  // Determine current phase based on room status
  let phase: GamePhase = "LOBBY";
  if (roomId && room) {
    if (room.status === "waiting") {
      phase = "SETUP";
    } else if (room.status === "playing") {
      phase = "GAME";
    } else if (room.status === "finished") {
      phase = "Result";
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 overflow-x-hidden">
      {/* Global Error Toast */}
      {(error || (roomId && !room && !loading)) && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 border border-red-500/50"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
          {error || "Room not found or disconnected"}
          <button onClick={() => setRoomId(null)} className="ml-2 underline text-xs">Close</button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === "LOBBY" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Lobby onRoomJoined={handleRoomJoined} />
          </motion.div>
        )}

        {phase === "SETUP" && room && playerId && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SetupBoard
              players={players}
              myId={playerId}
              roomId={room.roomId}
              gridSize={room.gridSize}
              onReady={handleBoardReady}
            />
            <button 
              onClick={handleLeaveRoom}
              className="fixed bottom-6 right-6 px-4 py-2 bg-slate-800/50 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-slate-700 hover:border-red-500/50 backdrop-blur-sm shadow-xl"
            >
              LEAVE ROOM
            </button>
          </motion.div>
        )}

        {phase === "GAME" && room && playerId && (
          <motion.div
            key="game"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
          >
            <GameBoard
              board={board}
              selectedNumbers={room.calledNumbers}
              turnIndex={room.turnIndex}
              myId={playerId}
              players={players}
              roomId={room.roomId}
              gridSize={room.gridSize}
            />
          </motion.div>
        )}
        
        {phase === "Result" && room && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 p-12 rounded-3xl text-center border border-slate-700 shadow-[0_0_50px_rgba(6,182,212,0.2)] max-w-sm w-full mx-4"
            >
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 mb-6 italic tracking-tighter">
                FINISH
              </h2>
              <p className="text-slate-400 mb-10 text-lg">The game has ended.</p>
              <button
                onClick={handleLeaveRoom}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white py-4 rounded-2xl font-black transition-all shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-1 active:translate-y-0"
              >
                RETURN TO LOBBY
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
