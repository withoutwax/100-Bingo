import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerDoc } from "../lib/firebase/types";
import { updatePlayerBoard, updateRoomStatus, leaveRoomSimple } from "../lib/firebase/roomService";
import clsx from "clsx";

interface SetupBoardProps {
  players: PlayerDoc[];
  myId: string;
  roomId: string;
  onReady: (board: number[]) => void;
}

const SetupBoard: React.FC<SetupBoardProps> = ({ players, myId, roomId, onReady }) => {
  const [board, setBoard] = useState<(number | "")[]>(Array(25).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const me = players.find(p => p.playerId === myId);
  const isHost = players.length > 0 && players[0].playerId === myId;
  const allReady = players.length >= 2 && players.every(p => p.isReady);

  const validateBoard = (currentBoard: (number | "")[]) => {
    const numbers = currentBoard.filter((n) => n !== "") as number[];
    const hasDuplicates = new Set(numbers).size !== numbers.length;
    const isFull = numbers.length === 25;
    const outOfRange = numbers.some((n) => n < 1 || n > 100);

    if (outOfRange) return "Numbers must be between 1 and 100";
    if (hasDuplicates) return "Duplicate numbers detected";
    if (!isFull) return "Fill all cells";
    return null;
  };

  const handleCellChange = (index: number, value: string) => {
    if (isReady) return;
    const num = parseInt(value);
    const newBoard = [...board];

    if (value === "") {
      newBoard[index] = "";
    } else if (!isNaN(num)) {
      newBoard[index] = num;
    }

    setBoard(newBoard);
    setError(validateBoard(newBoard));
  };

  const handleRandomFill = () => {
    if (isReady) return;
    const pool = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const newBoard = pool.slice(0, 25);
    setBoard(newBoard);
    setError(null);
  };

  const handleReady = async () => {
    const validationError = validateBoard(board);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsReady(true);
    const validBoard = board as number[];
    onReady(validBoard);
    
    try {
      await updatePlayerBoard(roomId, myId, validBoard);
    } catch (err) {
      console.error("Failed to update board:", err);
      setIsReady(false);
    }
  };

  const handleStartGame = async () => {
    if (!allReady || !isHost) return;
    try {
      await updateRoomStatus(roomId, "playing");
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid lg:grid-cols-[1fr_320px] gap-8"
      >
        {/* Left: Board Setup */}
        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Setup Board
              </h2>
              <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Configure your 5x5 grid</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRandomFill}
                disabled={isReady}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-black transition-all disabled:opacity-30 border border-slate-600"
              >
                RANDOM
              </button>
              <button
                onClick={handleReady}
                disabled={isReady || !!validateBoard(board)}
                className={clsx(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all shadow-lg",
                  isReady 
                    ? "bg-green-600/20 text-green-400 border border-green-500/30" 
                    : "bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
                )}
              >
                {isReady ? "READY" : "CONFIRM"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-8">
            {board.map((cell, idx) => {
              const isDuplicate = cell !== "" && board.filter((v) => v === cell).length > 1;
              const isOutOfRange = typeof cell === "number" && (cell < 1 || cell > 100);
              const isInvalid = isDuplicate || isOutOfRange;

              return (
                <motion.div
                  key={idx}
                  whileHover={!isReady ? { scale: 1.05 } : {}}
                  className="relative"
                >
                  <input
                    type="number"
                    value={cell}
                    disabled={isReady}
                    onChange={(e) => handleCellChange(idx, e.target.value)}
                    className={clsx(
                      "w-full aspect-square text-center text-xl font-black rounded-2xl border-2 outline-none transition-all",
                      isReady
                        ? "bg-slate-800/50 border-slate-700 text-slate-500"
                        : "bg-slate-700/50 text-white shadow-inner",
                      isInvalid
                        ? "border-red-500 bg-red-900/10"
                        : "border-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10",
                    )}
                  />
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-center font-bold text-sm mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {isHost && (
            <div className="mt-8 pt-8 border-t border-slate-700/50 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  allReady ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                )} />
                <p className="text-slate-400 text-sm font-medium">
                  {allReady 
                    ? "Everyone is ready!" 
                    : `Waiting for players... (${players.filter(p => p.isReady).length}/${players.length})`}
                </p>
              </div>
              <button
                onClick={handleStartGame}
                disabled={!allReady}
                className="w-full max-w-sm py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 rounded-2xl font-black text-lg transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-cyan-500/20 transform hover:-translate-y-1 active:translate-y-0"
              >
                START BINGO
              </button>
            </div>
          )}
        </div>

        {/* Right: Players List */}
        <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl h-fit">
          <h3 className="text-xs font-black mb-6 text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
            Lobby
          </h3>
          <ul className="space-y-3">
            <AnimatePresence>
              {players.map((p) => (
                <motion.li
                  key={p.playerId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex justify-between items-center bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg",
                      p.playerId === myId ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-400"
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
                      {players[0].playerId === p.playerId && (
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Host</span>
                      )}
                    </div>
                  </div>
                  <div className={clsx(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter",
                    p.isReady
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                  )}>
                    {p.isReady ? "Ready" : "Wait"}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupBoard;
