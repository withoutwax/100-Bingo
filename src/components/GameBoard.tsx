import React from "react";
import { useSocket } from "../context/SocketContext";
import { Player } from "../types";
import clsx from "clsx";

interface GameBoardProps {
  board: number[];
  selectedNumbers: number[];
  turnPlayerId: string;
  myId: string;
  players: Player[];
  roomId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedNumbers,
  turnPlayerId,
  myId,
  players,
  roomId,
}) => {
  const { socket } = useSocket();
  const isMyTurn = turnPlayerId === myId;
  const currentTurnPlayer = players.find((p) => p.socketId === turnPlayerId);

  const handleSelect = (num: number) => {
    if (!isMyTurn || selectedNumbers.includes(num)) return;
    socket?.emit("select_number", { roomId, number: num });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main Game Area */}
        <div className="flex flex-col items-center">
          {/* Status Header */}
          <div className="mb-8 text-center">
            <h2
              className={clsx(
                "text-3xl font-bold mb-2",
                isMyTurn
                  ? "text-green-400 scale-110 transition-transform"
                  : "text-slate-300",
              )}
            >
              {isMyTurn
                ? "YOUR TURN!"
                : `Waiting for ${currentTurnPlayer?.nickname || "opponent"}...`}
            </h2>
            <div className="text-slate-500 text-sm">Room: {roomId}</div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 gap-3 bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-700">
            {board.map((num, idx) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button
                  key={idx}
                  disabled={!isMyTurn || isSelected}
                  onClick={() => handleSelect(num)}
                  className={clsx(
                    "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-xl font-bold rounded-lg transition-all transform",
                    isSelected
                      ? "bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-inner scale-95"
                      : isMyTurn
                        ? "bg-slate-700 hover:bg-cyan-600 hover:scale-105 cursor-pointer text-white shadow-lg border border-slate-600 hover:border-cyan-400"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-700",
                  )}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Players Status */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-slate-700 pb-2">
              Players
            </h3>
            <ul className="space-y-2">
              {players.map((p) => (
                <li
                  key={p.socketId}
                  className={clsx(
                    "flex items-center justify-between p-2 rounded",
                    p.socketId === turnPlayerId
                      ? "bg-slate-700 ring-1 ring-cyan-500"
                      : "",
                  )}
                >
                  <span
                    className={
                      p.socketId === myId
                        ? "text-cyan-400 font-bold"
                        : "text-slate-300"
                    }
                  >
                    {p.nickname} {p.socketId === myId && "(You)"}
                  </span>
                  {p.socketId === turnPlayerId && (
                    <span className="text-xs text-cyan-500 font-mono animate-pulse">
                      THINKING
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* History Logs */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg h-64 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-slate-300 border-b border-slate-700 pb-2">
              Call History
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {[...selectedNumbers].reverse().map((num, i) => (
                <div
                  key={num}
                  className="text-sm text-slate-400 flex justify-between"
                >
                  <span>Turn {selectedNumbers.length - i}</span>
                  <span className="font-mono text-cyan-400 font-bold text-lg">
                    {num}
                  </span>
                </div>
              ))}
              {selectedNumbers.length === 0 && (
                <div className="text-slate-600 text-center italic mt-10">
                  No numbers called yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
