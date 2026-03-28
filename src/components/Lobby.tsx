import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoom, joinRoom, getWaitingRooms } from "../lib/firebase/roomService";
import { RoomDoc } from "../lib/firebase/types";
import clsx from "clsx";

interface LobbyProps {
  onRoomJoined: (roomId: string, playerId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onRoomJoined }) => {
  const [rooms, setRooms] = useState<RoomDoc[]>([]);
  const [nickname, setNickname] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRooms = async () => {
    setRefreshing(true);
    try {
      const availableRooms = await getWaitingRooms();
      setRooms(availableRooms);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !roomName) return;

    setLoading(true);
    try {
      const roomId = await createRoom(nickname, roomName);
      const { auth } = await import("../lib/firebase/config");
      const playerId = auth.currentUser?.uid || "";
      onRoomJoined(roomId, playerId);
    } catch (err) {
      console.error("Create Room Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (room: RoomDoc) => {
    if (!nickname) {
      alert("Please enter a nickname first!");
      return;
    }

    setLoading(true);
    try {
      await joinRoom(room.roomId, nickname);
      const { auth } = await import("../lib/firebase/config");
      const playerId = auth.currentUser?.uid || "";
      onRoomJoined(room.roomId, playerId);
    } catch (err) {
      console.error("Join Room Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4"
          >
            <span className="text-cyan-400 text-xs font-black tracking-widest uppercase">Multiplayer PoC</span>
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500 drop-shadow-2xl">
            100 BINGO
          </h1>
          <p className="text-slate-500 mt-4 font-medium tracking-wide text-lg uppercase tracking-[0.2em]">Strategic Battle Grid</p>
        </div>

        <div className="grid md:grid-cols-[340px_1fr] gap-8">
          {/* Left: Nickname & Actions */}
          <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Your Identity</label>
              <input
                type="text"
                maxLength={12}
                placeholder="NICKNAME..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl p-4 text-center font-black tracking-tight transition-all outline-none text-white placeholder-slate-800"
              />

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setShowCreate(!showCreate)}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black tracking-tight hover:bg-slate-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95"
                >
                  {showCreate ? "CANCEL" : "CREATE NEW GAME"}
                </button>
                <button
                  onClick={fetchRooms}
                  disabled={refreshing}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black tracking-tight transition-all border border-slate-700 flex items-center justify-center gap-2 group"
                >
                  <span className={clsx("w-1.5 h-1.5 bg-cyan-400 rounded-full", refreshing && "animate-ping")} />
                  {refreshing ? "REFRESHING..." : "SYNC LIST"}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showCreate && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleCreate}
                  className="bg-cyan-600 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-3">Room Secret Name</label>
                  <input
                    type="text"
                    placeholder="BATTLE ZONE #1"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                    className="w-full bg-white/20 border-2 border-white/20 placeholder:text-white/40 focus:bg-white/30 rounded-2xl p-4 font-black transition-all outline-none text-white mb-4"
                  />
                  <button
                    type="submit"
                    disabled={loading || !roomName || !nickname}
                    className="w-full py-4 bg-white text-cyan-600 rounded-2xl font-black transition-all disabled:opacity-50 active:scale-95 shadow-xl"
                  >
                    DEPLOY ROOM
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Room List */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden min-h-[450px]">
            <div className="p-8 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Available Battles</h3>
              <span className="text-[10px] font-black px-3 py-1 bg-slate-700/50 rounded-full text-cyan-400 border border-slate-600 uppercase tracking-tighter">
                {rooms.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {rooms.length > 0 ? (
                  <div className="grid gap-4">
                    {rooms.map((room) => (
                      <motion.div
                        key={room.roomId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group flex flex-col md:flex-row items-center justify-between p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800 hover:border-cyan-500/50 transition-all hover:bg-slate-900/80 shadow-lg"
                      >
                        <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                          <span className="text-xl font-black tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{room.roomName || 'Unnamed Unit'}</span>
                          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                              Grid: {room.gridSize}x{room.gridSize}
                            </span>
                            <span className="text-[10px] text-slate-700 font-medium">
                              Created {new Date(room.createdAt.toMillis()).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoin(room)}
                          disabled={loading}
                          className="px-8 py-3 bg-slate-800 hover:bg-cyan-600 text-white rounded-2xl font-black transition-all group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-slate-700 group-hover:border-cyan-400 active:scale-95"
                        >
                          JOIN BATTLE
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-6">
                    <div className="relative">
                       <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
                       </div>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning Grid for Activity...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
