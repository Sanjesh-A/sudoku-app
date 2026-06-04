import type { Grid, CellValue } from './types'

const SIZE = 9
const BOX = 3

/**
 * Returns true if placing `value` at (row, col) would conflict with
 * another non-empty cell in the same row, column, or 3x3 box.
 *
 * The cell at (row, col) itself is ignored, so this works whether or
 * not that cell already contains `value`.
 *
 * A value of 0 (empty) never conflicts.
 */
export function hasConflict(
  grid: Grid,
  row: number,
  col: number,
  value: CellValue,
): boolean {
  if (value === 0) return false

  // Same row, different column
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && grid[row][c] === value) return true
  }

  // Same column, different row
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && grid[r][col] === value) return true
  }

  // Same 3x3 box, different cell
  const boxRow = Math.floor(row / BOX) * BOX
  const boxCol = Math.floor(col / BOX) * BOX
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) return true
    }
  }

  return false
}

/**
 * Returns true if the grid is completely filled with a valid solution:
 * every row, column, and 3x3 box contains exactly the digits 1-9.
 */
export function isComplete(grid: Grid): boolean {
  // No empty cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return false
    }
  }

  // Rows and columns: each must contain exactly 1-9
  for (let i = 0; i < SIZE; i++) {
    const rowValues = new Set<CellValue>()
    const colValues = new Set<CellValue>()
    for (let j = 0; j < SIZE; j++) {
      rowValues.add(grid[i][j])
      colValues.add(grid[j][i])
    }
    if (rowValues.size !== SIZE || colValues.size !== SIZE) return false
  }

  // Boxes: each 3x3 box must contain exactly 1-9
  for (let boxRow = 0; boxRow < BOX; boxRow++) {
    for (let boxCol = 0; boxCol < BOX; boxCol++) {
      const boxValues = new Set<CellValue>()
      for (let r = 0; r < BOX; r++) {
        for (let c = 0; c < BOX; c++) {
          boxValues.add(grid[boxRow * BOX + r][boxCol * BOX + c])
        }
      }
      if (boxValues.size !== SIZE) return false
    }
  }

  return true
}