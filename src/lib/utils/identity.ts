/**
 * Persistent Player ID Utility
 * Generates and stores a unique player ID in the browser's local storage.
 * This replaces the need for Firebase Anonymous Authentication.
 */

const PLAYER_ID_KEY = "bingo_player_id";

export const getPersistentPlayerId = (): string => {
  if (typeof window === "undefined") return ""; // SSR safety

  let playerId = localStorage.getItem(PLAYER_ID_KEY);

  if (!playerId) {
    // Generate a simple UUID
    playerId = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }

  return playerId;
};
