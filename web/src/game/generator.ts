import type { Difficulty, Grid, Puzzle, CellValue } from './types'

const SIZE = 9
const BOX = 3

/**
 * Fisher-Yates shuffle. Returns a new array; does not mutate the input.
 */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds a known-valid Sudoku grid using a row-shift pattern.
 *
 * Each row r is row 0 (1..9) shifted left by some amount. The shift is
 * chosen so the result satisfies all three Sudoku constraints:
 *
 *   shift(r) = BOX * positionInBand(r) + bandIndex(r)
 *
 * - positionInBand(r) = r % 3, multiplied by 3 → rows inside a band
 *   shift by 3 each, so the 3x3 box covers all 9 digits.
 * - bandIndex(r) = floor(r / 3) → the +1 between bands prevents the
 *   first row of the next band from duplicating an existing row,
 *   keeping every column a permutation of 1..9.
 *
 * The shifts cycle 0, 3, 6, 1, 4, 7, 2, 5, 8 → a permutation of 0..8.
 */
function buildBaseGrid(): Grid {
  const grid: Grid = []
  for (let r = 0; r < SIZE; r++) {
    const positionInBand = r % BOX
    const bandIndex = Math.floor(r / BOX)
    const shift = BOX * positionInBand + bandIndex

    const row: CellValue[] = []
    for (let c = 0; c < SIZE; c++) {
      row.push(((shift + c) % SIZE + 1) as CellValue)
    }
    grid.push(row)
  }
  return grid
}

/**
 * Relabels digits by a random permutation of 1..9.
 *
 * Sudoku digits are arbitrary symbols; swapping every 7 for every 3
 * everywhere preserves validity. Source of 9! = 362,880 variants.
 */
function relabelDigits(grid: Grid): Grid {
  const mapping = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[])
  return grid.map(row => row.map(n => mapping[n - 1]))
}

/**
 * Reorders 3 sibling rows (or columns) by the given index permutation.
 * Rows in a band — and columns in a stack — are interchangeable: each
 * contributes the same 3 cells to each box, so reordering them keeps
 * every box, row, and column valid.
 */
function permuteTriple<T>(items: T[], order: number[]): T[] {
  return order.map(i => items[i])
}

/**
 * Shuffles rows within each band (rows 0-2, 3-5, 6-8) independently.
 */
function shuffleRowsWithinBands(grid: Grid): Grid {
  const result: Grid = []
  for (let band = 0; band < BOX; band++) {
    const bandRows = grid.slice(band * BOX, band * BOX + BOX)
    const order = shuffle([0, 1, 2])
    result.push(...permuteTriple(bandRows, order))
  }
  return result
}

/**
 * Shuffles the 3 bands themselves (each band is 3 consecutive rows).
 * Moving a whole band preserves the internal box structure.
 */
function shuffleBands(grid: Grid): Grid {
  const bands: Grid[] = []
  for (let band = 0; band < BOX; band++) {
    bands.push(grid.slice(band * BOX, band * BOX + BOX))
  }
  const order = shuffle([0, 1, 2])
  return permuteTriple(bands, order).flat()
}

/**
 * Shuffles columns within each stack (cols 0-2, 3-5, 6-8) independently.
 * Columns in a stack are interchangeable: each contributes the same
 * 3 cells to each box, so reordering them keeps every box, row, and
 * column valid.
 */
function shuffleColumnsWithinStacks(grid: Grid): Grid {
  const result: Grid = grid.map(() => [] as CellValue[])
  for (let stack = 0; stack < BOX; stack++) {
    const order = shuffle([0, 1, 2])
    for (let r = 0; r < SIZE; r++) {
      const stackCols = [
        grid[r][stack * BOX],
        grid[r][stack * BOX + 1],
        grid[r][stack * BOX + 2],
      ]
      const reordered = permuteTriple(stackCols, order)
      result[r].push(...reordered)
    }
  }
  return result
}

/**
 * Shuffles the 3 stacks themselves (each stack is 3 consecutive columns).
 * Moving a whole stack preserves the internal box structure.
 */
function shuffleStacks(grid: Grid): Grid {
  const order = shuffle([0, 1, 2])
  return grid.map(row => {
    const stacks: CellValue[][] = []
    for (let stack = 0; stack < BOX; stack++) {
      stacks.push([row[stack * BOX], row[stack * BOX + 1], row[stack * BOX + 2]])
    }
    return permuteTriple(stacks, order).flat()
  })
}


/**
 * Generates a complete, valid Sudoku solution.
 *
 * Strategy: start from a known-valid base grid, then apply
 * transformations that each preserve Sudoku validity:
 *
 *   1. Relabel the digits (9! variants)
 *   2. Shuffle rows within bands, and the bands themselves
 *   3. Do the same for columns within stacks, and the stacks themselves
 *      (implemented as: transpose, do the row variants, transpose back)
 *
 * Together these yield ~3.6 x 10^10 distinct grids.
 */
export function generateSolution(): Grid {
  let grid = buildBaseGrid()
  grid = relabelDigits(grid)
  grid = shuffleRowsWithinBands(grid)
  grid = shuffleBands(grid)
  grid = shuffleColumnsWithinStacks(grid)
  grid = shuffleStacks(grid)
  return grid
}

const CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 40,
  medium: 48,
  hard: 54,
}

/**
 * Generates a puzzle by creating a full solution then removing cells.
 * The number of cells removed depends on difficulty.
 */
export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateSolution()
  const puzzle: Grid = solution.map(row => [...row])
  const toRemove = CELLS_TO_REMOVE[difficulty]

  const positions = shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => i))
  let removed = 0
  for (const i of positions) {
    if (removed >= toRemove) break
    const r = Math.floor(i / SIZE)
    const c = i % SIZE
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0
      removed++
    }
  }

  return { puzzle, solution, difficulty }
}