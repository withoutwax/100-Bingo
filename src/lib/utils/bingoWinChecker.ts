/**
 * Checks if the current board marks satisfy the bingo win condition.
 * 
 * @param boardMarks - A 1D array of booleans where true means the number is marked.
 * @param gridSize - The size of one side of the grid (e.g., 5 for 5x5).
 * @returns boolean - True if there's at least one bingo line (row, column, or diagonal).
 */
export function checkBingoWin(boardMarks: boolean[], gridSize: number): boolean {
  // 1. Check Rows (Horizontal)
  for (let row = 0; row < gridSize; row++) {
    let rowWin = true;
    for (let col = 0; col < gridSize; col++) {
      if (!boardMarks[row * gridSize + col]) {
        rowWin = false;
        break;
      }
    }
    if (rowWin) return true;
  }

  // 2. Check Columns (Vertical)
  for (let col = 0; col < gridSize; col++) {
    let colWin = true;
    for (let row = 0; row < gridSize; row++) {
      if (!boardMarks[row * gridSize + col]) {
        colWin = false;
        break;
      }
    }
    if (colWin) return true;
  }

  // 3. Check Main Diagonal (Top-Left to Bottom-Right)
  let mainDiagWin = true;
  for (let i = 0; i < gridSize; i++) {
    if (!boardMarks[i * gridSize + i]) {
      mainDiagWin = false;
      break;
    }
  }
  if (mainDiagWin) return true;

  // 4. Check Anti-Diagonal (Top-Right to Bottom-Left)
  let antiDiagWin = true;
  for (let i = 0; i < gridSize; i++) {
    if (!boardMarks[i * gridSize + (gridSize - 1 - i)]) {
      antiDiagWin = false;
      break;
    }
  }
  if (antiDiagWin) return true;

  return false;
}
