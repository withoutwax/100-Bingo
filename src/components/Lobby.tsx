import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { RoomPreview } from "../types";

interface LobbyProps {}

const Lobby: React.FC<LobbyProps> = () => {
  const { socket } = useSocket();
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [roomTarget, setRoomTarget] = useState(""); // Name for create
  const [rooms, setRooms] = useState<RoomPreview[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomPreview | null>(null);

  useEffect(() => {
    if (mode === "join" && socket) {
      console.log("Fetching rooms...");
      socket.emit("get_rooms");

      const handleRoomList = (list: RoomPreview[]) => {
        console.log("Received room list:", list);
        setRooms(list);
      };

      socket.on("room_list", handleRoomList);

      return () => {
        socket.off("room_list", handleRoomList);
      };
    }
  }, [mode, socket]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !nickname || !roomTarget) return;
    console.log("Emitting create_room");
    socket.emit("create_room", { nickname, roomName: roomTarget });
  };

  const handleJoinConfirm = () => {
    if (!socket || !nickname || !selectedRoom) return;
    console.log("Emitting join_room to:", selectedRoom.roomId);
    socket.emit("join_room", { roomId: selectedRoom.roomId, nickname });
    setSelectedRoom(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 relative">
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

        <div className="space-y-4">
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

          {mode === "create" ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomTarget}
                  onChange={(e) => setRoomTarget(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white placeholder-slate-500"
                  placeholder="My Awesome Room"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Create & Enter
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-400">
                  Available Rooms
                </label>
                <button
                  onClick={() => socket?.emit("get_rooms")}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Refresh
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                {rooms.length === 0 ? (
                  <div className="text-slate-500 text-center py-4 bg-slate-700/30 rounded-lg">
                    No rooms found.
                  </div>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.roomId}
                      onClick={() => {
                        if (!nickname) {
                          alert("Please enter a nickname first!");
                          return;
                        }
                        setSelectedRoom(room);
                      }}
                      className="flex justify-between items-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left group"
                    >
                      <span className="font-medium text-slate-200 group-hover:text-white">
                        {room.roomName || `Room ${room.roomId}`}
                      </span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
                        {room.playerCount} Players
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Join Confirmation Modal */}
      {selectedRoom && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl w-full max-w-sm transform scale-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-2">Join Room?</h3>
            <p className="text-slate-300 mb-6">
              Do you want to enter{" "}
              <span className="text-cyan-400 font-bold">
                {selectedRoom.roomName || selectedRoom.roomId}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinConfirm}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
