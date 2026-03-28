import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoom, joinRoom, getWaitingRooms, subscribeToWaitingRooms } from "../lib/firebase/roomService";
import { RoomDoc } from "../lib/firebase/types";
import { getPersistentPlayerId } from "../lib/utils/identity";
import clsx from "clsx";

interface LobbyProps {
  onRoomJoined: (roomId: string, playerId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onRoomJoined }) => {
  const [rooms, setRooms] = useState<RoomDoc[]>([]);
  const [nickname, setNickname] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [gridSize, setGridSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  // Password prompt state
  const [joiningRoom, setJoiningRoom] = useState<RoomDoc | null>(null);
  const [inputPassword, setInputPassword] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

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
    // Use real-time subscription
    const unsubscribe = subscribeToWaitingRooms((updatedRooms) => {
      setRooms(updatedRooms);
    });
    
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !roomName) return;

    setLoading(true);
    try {
      const roomId = await createRoom(nickname, roomName, gridSize, roomPassword || null);
      const playerId = getPersistentPlayerId();
      onRoomJoined(roomId, playerId);
    } catch (err) {
      console.error("Create Room Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAttempt = (room: RoomDoc) => {
    if (!nickname) {
      alert("Please enter a nickname first!");
      return;
    }

    if (room.password) {
      setJoiningRoom(room);
      setInputPassword("");
      setJoinError(null);
    } else {
      performJoin(room.roomId);
    }
  };

  const performJoin = async (roomId: string, password?: string) => {
    setLoading(true);
    setJoinError(null);
    try {
      await joinRoom(roomId, nickname, password);
      const playerId = getPersistentPlayerId();
      onRoomJoined(roomId, playerId);
    } catch (err: any) {
      console.error("Join Room Error:", err);
      setJoinError(err.message || "Failed to join room");
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
                  className="bg-cyan-600 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 ml-1">Room Secret Name</label>
                    <input
                      type="text"
                      placeholder="BATTLE ZONE #1"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                      className="w-full bg-white/20 border-2 border-white/20 placeholder:text-white/40 focus:bg-white/30 rounded-2xl p-4 font-black transition-all outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 ml-1">Grid Dimension</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 4, 5].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setGridSize(size)}
                          className={clsx(
                            "py-3 rounded-xl font-black transition-all border-2",
                            gridSize === size 
                              ? "bg-white text-cyan-600 border-white" 
                              : "bg-white/10 text-white/60 border-transparent hover:bg-white/20"
                          )}
                        >
                          {size}x{size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 ml-1">Optional Password</label>
                    <input
                      type="password"
                      placeholder="SECRET KEY"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      className="w-full bg-white/20 border-2 border-white/20 placeholder:text-white/40 focus:bg-white/30 rounded-2xl p-4 font-black transition-all outline-none text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !roomName || !nickname}
                    className="w-full py-4 bg-white text-cyan-600 rounded-2xl font-black transition-all disabled:opacity-50 active:scale-95 shadow-xl mt-2"
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
                          <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className="text-xl font-black tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{room.roomName || 'Unnamed Unit'}</span>
                            {room.password && (
                              <div className="w-4 h-4 text-slate-500 group-hover:text-cyan-500 transition-colors">
                                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                              Grid: {room.gridSize}x{room.gridSize}
                            </span>
                            <span className="text-[10px] text-slate-700 font-medium">
                              Created {new Date(room.createdAt instanceof Date ? room.createdAt : room.createdAt.toMillis()).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinAttempt(room)}
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

      {/* Password Modal */}
      <AnimatePresence>
        {joiningRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <svg className="w-8 h-8 text-cyan-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Secured Unit</h3>
                <p className="text-slate-500 text-sm mt-2">Enter the key to join <span className="text-cyan-500 font-bold">{joiningRoom.roomName}</span></p>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  autoFocus
                  placeholder="PASSWORD"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && performJoin(joiningRoom.roomId, inputPassword)}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-cyan-500 rounded-2xl p-4 text-center font-black tracking-tight outline-none"
                />
                
                {joinError && (
                  <p className="text-red-400 text-xs font-bold text-center uppercase tracking-widest">{joinError}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button
                    onClick={() => setJoiningRoom(null)}
                    className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black transition-all"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={() => performJoin(joiningRoom.roomId, inputPassword)}
                    disabled={loading || !inputPassword}
                    className="py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50"
                  >
                    {loading ? "VERIFYING..." : "DEPLOY"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lobby;
