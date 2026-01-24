import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";

interface LobbyProps {}

const Lobby: React.FC<LobbyProps> = () => {
  const { socket } = useSocket();
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [roomTarget, setRoomTarget] = useState(""); // Name for create, ID for join

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !nickname || !roomTarget) return;

    if (mode === "create") {
      socket.emit("create_room", { nickname, roomName: roomTarget });
    } else {
      socket.emit("join_room", { roomId: roomTarget, nickname });
    }
    // Optimistically assuming success handled by App listener or just callback immediately?
    // We should probably wait for a success event, but for now we rely on App's player_joined listener to switch state?
    // Actually, App will handle the state switch if it receives data.
    // However, to provide feedback (like button loading), we might want to wait.
    // For this simple implementation, we rely on the socket event 'player_joined' in App to trigger the transition.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Strategic 5x5 Bingo
        </h1>

        <div className="flex mb-6 bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-md transition-all ${
              mode === "create"
                ? "bg-cyan-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-md transition-all ${
              mode === "join"
                ? "bg-cyan-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white placeholder-slate-500"
              placeholder="Enter your nickname"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {mode === "create" ? "Room Name" : "Room ID"}
            </label>
            <input
              type="text"
              value={roomTarget}
              onChange={(e) => setRoomTarget(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white placeholder-slate-500"
              placeholder={mode === "create" ? "My Awesome Room" : "12345"}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {mode === "create" ? "Create & Enter" : "Join Game"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
