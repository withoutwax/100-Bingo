import { useEffect, useState } from "react";
import { useSocket } from "./context/SocketContext";
import Lobby from "./components/Lobby";
import SetupBoard from "./components/SetupBoard";
import GameBoard from "./components/GameBoard";
import { GamePhase, RoomInfo } from "./types";

function App() {
  const { socket, connected } = useSocket();
  const [phase, setPhase] = useState<GamePhase>("LOBBY");
  const [myId, setMyId] = useState<string>("");
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [board, setBoard] = useState<number[]>([]); // My board
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [turnPlayerId, setTurnPlayerId] = useState<string>("");
  const [winner, setWinner] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setMyId(socket.id || "");
    });

    socket.on("player_joined", (payload: any) => {
      // Payload might be RoomInfo object: { roomId, roomName, players }
      // Or generic 'players' update.
      // Assuming payload matches RoomInfo structure or similar
      console.log("Player Joined:", payload);
      if (payload.players) {
        setRoomInfo({ ...payload }); // Update room info
        // If I just joined and I'm in LOBBY, move to SETUP
        setPhase((p) => (p === "LOBBY" ? "SETUP" : p));
      }
    });

    socket.on("game_start", (payload: { turnPlayerId: string }) => {
      console.log("Game Start:", payload);
      setTurnPlayerId(payload.turnPlayerId);
      setPhase("GAME");
    });

    socket.on(
      "number_selected",
      (payload: { number: number; nextTurnPlayerId: string }) => {
        console.log("Number Selected:", payload);
        setSelectedNumbers((prev) => [...prev, payload.number]);
        setTurnPlayerId(payload.nextTurnPlayerId);
      },
    );

    socket.on("game_over", (payload: { winnerId: string }) => {
      console.log("Game Over:", payload);
      setWinner(payload.winnerId);
      // setPhase('Result'); // Or just show modal overlay
    });

    socket.on("error_message", (msg: string) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    });

    return () => {
      socket.off("connect");
      socket.off("player_joined");
      socket.off("game_start");
      socket.off("number_selected");
      socket.off("game_over");
      socket.off("error_message");
    };
  }, [socket]);

  // Capture board from Setup component before ready
  // Actually, SetupBoard emits 'player_ready' with board.
  // We should also store it locally to pass to GameBoard.
  // We can just lift the board state up or capture it.
  // For now, let's assume SetupBoard keeps its own state, but when we transition to Game,
  // we need the board configuration.
  // Wait, GameBoard needs `board` prop.
  // So SetupBoard should either tell App the board, or App should hold the board state.
  // I will lift board state to App so it persists.

  const handleBoardReady = (finalBoard: number[]) => {
    setBoard(finalBoard);
    // NOTE: SetupBoard emits 'player_ready' itself.
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-cyan-500 animate-pulse">
        Connecting to Server...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      {/* Global Error Toast */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
          {errorMsg}
        </div>
      )}

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 p-10 rounded-2xl text-center border border-slate-700 shadow-2xl transform scale-105">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
              GAME OVER
            </h2>
            <p className="text-2xl text-white mb-8">
              {winner === myId ? "🏆 YOU WON! 🏆" : "Better luck next time!"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-cyan-500/50"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {phase === "LOBBY" && <Lobby />}

      {phase === "SETUP" && roomInfo && (
        <SetupBoard
          players={roomInfo.players}
          myId={myId}
          onReady={handleBoardReady}
        />
      )}

      {phase === "GAME" && roomInfo && (
        <GameBoard
          board={board}
          selectedNumbers={selectedNumbers}
          turnPlayerId={turnPlayerId}
          myId={myId}
          players={roomInfo.players}
          roomId={roomInfo.roomId}
        />
      )}
    </div>
  );
}

export default App;
