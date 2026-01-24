export interface Player {
  id: string;
  nickname: string;
  isReady: boolean;
  score?: number; // If needed
}

export interface RoomInfo {
  roomId: string; // or roomName
  roomName: string;
  players: Player[];
}

export type GamePhase = "LOBBY" | "SETUP" | "GAME" | "Result";

export interface GameStartPayload {
  turnPlayerId: string;
}

export interface NumberSelectedPayload {
  number: number;
  nextTurnPlayerId: string;
}

export interface GameOverPayload {
  winnerId: string;
}
