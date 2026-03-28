import { describe, it, expect } from 'vitest';
import { checkBingoWin } from '../bingoWinChecker';

describe('checkBingoWin', () => {
  const size = 5;

  it('should return false for an empty board', () => {
    const board = new Array(size * size).fill(false);
    expect(checkBingoWin(board, size)).toBe(false);
  });

  it('should return true for a horizontal bingo in the first row', () => {
    const board = new Array(size * size).fill(false);
    // Mark first row
    for (let i = 0; i < size; i++) board[i] = true;
    expect(checkBingoWin(board, size)).toBe(true);
  });

  it('should return true for a horizontal bingo in the last row', () => {
    const board = new Array(size * size).fill(false);
    // Mark last row
    for (let i = (size - 1) * size; i < size * size; i++) board[i] = true;
    expect(checkBingoWin(board, size)).toBe(true);
  });

  it('should return true for a vertical bingo in the first column', () => {
    const board = new Array(size * size).fill(false);
    // Mark first column
    for (let i = 0; i < size; i++) board[i * size] = true;
    expect(checkBingoWin(board, size)).toBe(true);
  });

  it('should return true for a vertical bingo in the last column', () => {
    const board = new Array(size * size).fill(false);
    // Mark last column
    for (let i = 0; i < size; i++) board[i * size + (size - 1)] = true;
    expect(checkBingoWin(board, size)).toBe(true);
  });

  it('should return true for a main diagonal bingo (top-left to bottom-right)', () => {
    const board = new Array(size * size).fill(false);
    // Mark main diagonal
    for (let i = 0; i < size; i++) board[i * size + i] = true;
    expect(checkBingoWin(board, size)).toBe(true);
  });

  it('should return true for an anti-diagonal bingo (top-right to bottom-left)', () => {
    const board = new Array(size * size).fill(false);
    // Mark anti-diagonal
    for (let i = 0; i < size; i++) board[i * size + (size - 1 - i)] = true;
    expect(checkBingoWin(board, size)).toBe(true);
  });

  it('should return false if not enough cells are marked to form a line', () => {
    const board = new Array(size * size).fill(false);
    // Mark 4 cells in the first row
    for (let i = 0; i < size - 1; i++) board[i] = true;
    expect(checkBingoWin(board, size)).toBe(false);
  });

  it('should work for different grid sizes (e.g., 3x3)', () => {
    const smallSize = 3;
    const board = new Array(smallSize * smallSize).fill(false);
    // Mark diagonal logic should still apply
    for (let i = 0; i < smallSize; i++) board[i * smallSize + i] = true;
    expect(checkBingoWin(board, smallSize)).toBe(true);
  });
});
