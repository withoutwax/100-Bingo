import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerDoc } from "../lib/firebase/types";
import { selectNumber, updateRoomStatus } from "../lib/firebase/roomService";
import { checkBingoWin } from "../lib/utils/bingoWinChecker";
import clsx from "clsx";

interface GameBoardProps {
  board: number[];
  selectedNumbers: number[];
  turnIndex: number;
  myId: string;
  players: PlayerDoc[];
  roomId: string;
  gridSize: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedNumbers,
  turnIndex,
  myId,
  players,
  roomId,
  gridSize,
}) => {
  const playerCount = players.length;
  const isMyTurn = players[turnIndex % playerCount]?.playerId === myId;
  const currentTurnPlayer = players[turnIndex % playerCount];

  // Calculate if I have a bingo
  const hasBingo = useMemo(() => {
    if (board.length === 0) return false;
    const marks = board.map(num => selectedNumbers.includes(num));
    return checkBingoWin(marks, gridSize);
  }, [board, selectedNumbers, gridSize]);

  // Handle win detection
  useEffect(() => {
    if (hasBingo) {
      updateRoomStatus(roomId, "finished");
    }
  }, [hasBingo, roomId]);

  const handleSelect = async (num: number) => {
    if (!isMyTurn || selectedNumbers.includes(num)) return;
    try {
      await selectNumber(roomId, num, playerCount);
    } catch (err) {
      console.error("Failed to select number:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_320px] gap-8 relative z-10">
        {/* Main Game Area */}
        <div className="flex flex-col items-center">
          {/* Status Header */}
          <div className="mb-10 text-center">
            <AnimatePresence mode="wait">
              <motion.h2
                key={isMyTurn ? "my-turn" : "opp-turn"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={clsx(
                  "text-4xl font-black mb-3 tracking-tight",
                  isMyTurn
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                    : "text-slate-400",
                )}
              >
                {isMyTurn
                  ? "YOUR TURN"
                  : `${currentTurnPlayer?.nickname.toUpperCase()}'S TURN`}
              </motion.h2>
            </AnimatePresence>
            <div className="px-3 py-1 bg-slate-800/80 rounded-full text-[10px] font-mono text-slate-500 border border-slate-700 inline-block uppercase tracking-widest">
              Room: {roomId} ({gridSize}x{gridSize})
            </div>
          </div>

          {/* Grid */}
          <div 
            className="grid gap-3 bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` 
            }}
          >
            {board.map((num, idx) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <motion.button
                  key={idx}
                  whileHover={!isSelected && isMyTurn ? { scale: 1.05, backgroundColor: "rgba(51, 65, 85, 1)" } : {}}
                  whileTap={!isSelected && isMyTurn ? { scale: 0.95 } : {}}
                  disabled={!isMyTurn || isSelected}
                  onClick={() => handleSelect(num)}
                  className={clsx(
                    "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-xl font-bold rounded-2xl transition-all duration-300 relative group",
                    isSelected
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border-none"
                      : isMyTurn
                        ? "bg-slate-700/80 text-white border border-slate-600 hover:border-cyan-400/50 shadow-lg cursor-pointer"
                        : "bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed",
                  )}
                >
                  <span className={clsx("relative z-10", isSelected && "scale-110")}>{num}</span>
                  {isSelected && (
                    <motion.div 
                      layoutId="strike"
                      className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse" 
                    />
                  )}
                  {!isSelected && isMyTurn && (
                    <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 rounded-2xl transition-colors" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Players Status */}
          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl">
            <h3 className="text-xs font-black mb-6 text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-1 h-3 bg-cyan-500 rounded-full" />
              Players
            </h3>
            <ul className="space-y-3">
              {players.map((p, idx) => {
                const isCurrentTurn = (turnIndex % playerCount) === idx;
                return (
                  <motion.li
                    key={p.playerId}
                    initial={false}
                    animate={{ 
                      x: isCurrentTurn ? 8 : 0,
                      backgroundColor: isCurrentTurn ? "rgba(6, 182, 212, 0.1)" : "rgba(30, 41, 59, 0.3)"
                    }}
                    className={clsx(
                      "flex items-center justify-between p-4 rounded-2xl transition-all border",
                      isCurrentTurn ? "border-cyan-500/30 ring-1 ring-cyan-500/20" : "border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-lg",
                        p.playerId === myId ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white" : "bg-slate-700 text-slate-400"
                      )}>
                        {p.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={clsx(
                          "font-bold text-sm",
                          p.playerId === myId ? "text-cyan-400" : "text-slate-200"
                        )}>
                          {p.nickname}
                        </span>
                        {p.playerId === myId && <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest">You</span>}
                      </div>
                    </div>
                    {isCurrentTurn && (
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>

          {/* History Logs */}
          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl h-[300px] flex flex-col">
            <h3 className="text-xs font-black mb-4 text-slate-500 uppercase tracking-[0.2em]">History</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {[...selectedNumbers].reverse().map((num, i) => (
                  <motion.div
                    key={num}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800/50"
                  >
                    <span className="text-[10px] font-mono text-slate-600">TURN {selectedNumbers.length - i}</span>
                    <span className="font-black text-xl text-cyan-400">{num}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedNumbers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-slate-700 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Waiting...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Heroic Win Overlay */}
      <AnimatePresence>
        {hasBingo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white px-12 py-6 rounded-full shadow-[0_0_100px_rgba(234,179,8,0.5)] border-4 border-yellow-200/50"
            >
              <h1 className="text-6xl font-black italic tracking-tighter drop-shadow-2xl">BINGO!</h1>
            </motion.div>
            
            {/* Simple particle effect placeholder */}
            <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;
