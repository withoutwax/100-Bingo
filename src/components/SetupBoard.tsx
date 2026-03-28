import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { Player } from "../types";
import clsx from "clsx";

interface SetupBoardProps {
  players: Player[];
  myId: string;
  onReady: (board: number[]) => void;
}

const SetupBoard: React.FC<SetupBoardProps> = ({ players, myId, onReady }) => {
  const { socket } = useSocket();
  const [board, setBoard] = useState<(number | "")[]>(Array(25).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Helper: Check validation
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
    setError(validateBoard(newBoard) && "Invalid board state"); // Simplistic inline check
  };

  const handleRandomFill = () => {
    if (isReady) return;
    const existing = new Set(board.filter((n) => n !== "") as number[]);
    const newBoard = [...board];
    const pool = Array.from({ length: 100 }, (_, i) => i + 1).filter(
      (n) => !existing.has(n),
    );

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let pIdx = 0;
    for (let i = 0; i < 25; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = pool[pIdx++];
      }
    }
    setBoard(newBoard);
    setError(null);
  };

  const handleReady = () => {
    const validationError = validateBoard(board);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsReady(true);
    const validBoard = board as number[];
    onReady(validBoard);
    socket?.emit("player_ready", { board: validBoard });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-[1fr_300px] gap-8">
        {/* Left: Board Setup */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Setup Your Board</h2>
            <div className="space-x-2">
              <button
                onClick={handleRandomFill}
                disabled={isReady}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                Random Fill
              </button>
              <button
                onClick={handleReady}
                disabled={isReady || !!validateBoard(board)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReady ? "Waiting..." : "Ready!"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {board.map((cell, idx) => {
              const isDuplicate =
                cell !== "" && board.filter((v) => v === cell).length > 1;
              const isOutOfRange =
                typeof cell === "number" && (cell < 1 || cell > 100);
              const isInvalid = isDuplicate || isOutOfRange;

              return (
                <input
                  key={idx}
                  type="number"
                  min="1"
                  max="100"
                  value={cell}
                  disabled={isReady}
                  onChange={(e) => handleCellChange(idx, e.target.value)}
                  className={clsx(
                    "w-full aspect-square text-center text-lg font-bold rounded-lg border-2 outline-none focus:ring-2 transition-all",
                    isReady
                      ? "bg-slate-700 border-slate-600 text-slate-400"
                      : "bg-slate-700 text-white",
                    isInvalid
                      ? "border-red-500 focus:ring-red-500 bg-red-900/20"
                      : "border-slate-600 focus:border-cyan-500 focus:ring-cyan-500",
                  )}
                />
              );
            })}
          </div>
          {error && (
            <p className="text-red-400 text-center font-medium">{error}</p>
          )}
        </div>

        {/* Right: Players List */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 h-fit">
          <h3 className="text-xl font-bold mb-4 text-slate-300">Players</h3>
          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.socketId}
                className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg"
              >
                <span
                  className={clsx(
                    "font-medium",
                    p.socketId === myId ? "text-cyan-400" : "text-slate-200",
                  )}
                >
                  {p.nickname} {p.socketId === myId && "(You)"}
                </span>
                <span
                  className={clsx(
                    "text-xs px-2 py-1 rounded-full",
                    p.isReady
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400",
                  )}
                >
                  {p.isReady ? "Ready" : "Preparing"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SetupBoard;
