import { Timestamp } from "firebase/firestore";

export type RoomStatus = "waiting" | "playing" | "finished";

export interface RoomDoc {
  roomId: string;
  hostId: string;
  roomName: string;
  password?: string | null;
  gridSize: number;
  winPattern: string | string[];
  status: RoomStatus;
  turnIndex: number;
  calledNumbers: number[];
  createdAt: Timestamp | Date;
}

export interface PlayerDoc {
  playerId: string;
  nickname: string;
  isReady: boolean;
  board: number[]; // 1D array of numbers
  joinedAt: Timestamp | Date;
}

export interface RoomWithPlayers extends RoomDoc {
  players: PlayerDoc[];
}
