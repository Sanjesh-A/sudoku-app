import { describe, it, expect } from 'vitest'
import { hasConflict, isComplete } from './validator'
import type { Grid, CellValue } from './types'

/**
 * Builds a 9x9 grid from a compact array of 81 values.
 * Makes test fixtures readable.
 */
function grid(values: number[]): Grid {
  if (values.length !== 81) {
    throw new Error(`Expected 81 values, got ${values.length}`)
  }
  const g: Grid = []
  for (let r = 0; r < 9; r++) {
    const row: CellValue[] = []
    for (let c = 0; c < 9; c++) {
      row.push(values[r * 9 + c] as CellValue)
    }
    g.push(row)
  }
  return g
}

// A valid completed sudoku
const SOLVED = grid([
  5, 3, 4, 6, 7, 8, 9, 1, 2,
  6, 7, 2, 1, 9, 5, 3, 4, 8,
  1, 9, 8, 3, 4, 2, 5, 6, 7,
  8, 5, 9, 7, 6, 1, 4, 2, 3,
  4, 2, 6, 8, 5, 3, 7, 9, 1,
  7, 1, 3, 9, 2, 4, 8, 5, 6,
  9, 6, 1, 5, 3, 7, 2, 8, 4,
  2, 8, 7, 4, 1, 9, 6, 3, 5,
  3, 4, 5, 2, 8, 6, 1, 7, 9,
])

// An empty grid
const EMPTY = grid(new Array(81).fill(0))

describe('hasConflict', () => {
  it('returns false for an empty value', () => {
    expect(hasConflict(SOLVED, 0, 0, 0)).toBe(false)
  })

  it('returns false for a value that fits in an empty grid', () => {
    expect(hasConflict(EMPTY, 0, 0, 5)).toBe(false)
  })

  describe('row conflicts', () => {
    it('detects a duplicate in the same row', () => {
      const g = grid(new Array(81).fill(0))
      g[0][3] = 5
      expect(hasConflict(g, 0, 7, 5)).toBe(true)
    })

    it('ignores the same column in a different row', () => {
      const g = grid(new Array(81).fill(0))
      g[5][3] = 5
      expect(hasConflict(g, 0, 7, 5)).toBe(false)
    })
  })

  describe('column conflicts', () => {
    it('detects a duplicate in the same column', () => {
      const g = grid(new Array(81).fill(0))
      g[3][2] = 7
      expect(hasConflict(g, 8, 2, 7)).toBe(true)
    })
  })

  describe('box conflicts', () => {
    it('detects a duplicate in the same 3x3 box', () => {
      const g = grid(new Array(81).fill(0))
      g[0][0] = 9
      expect(hasConflict(g, 2, 2, 9)).toBe(true)
    })

    it('does not flag a duplicate in a different box', () => {
      const g = grid(new Array(81).fill(0))
      g[0][0] = 9
      expect(hasConflict(g, 3, 3, 9)).toBe(false)
    })

    it('checks across all 9 cells of the box', () => {
      // Place a 4 at the top-left of the middle box (3,3) and check (5,5)
      const g = grid(new Array(81).fill(0))
      g[3][3] = 4
      expect(hasConflict(g, 5, 5, 4)).toBe(true)
    })
  })

  describe('self-cell handling', () => {
    it('does not flag the cell against itself', () => {
      // Cell (0,0) is 5 in SOLVED. Placing 5 at (0,0) should not conflict
      // with itself — though it WILL conflict with the other 5s in the
      // solved grid.
      const g = grid(new Array(81).fill(0))
      g[0][0] = 5
      expect(hasConflict(g, 0, 0, 5)).toBe(false)
    })
  })
})

describe('isComplete', () => {
  it('returns true for a valid solved grid', () => {
    expect(isComplete(SOLVED)).toBe(true)
  })

  it('returns false for an empty grid', () => {
    expect(isComplete(EMPTY)).toBe(false)
  })

  it('returns false when any cell is empty', () => {
    const g = SOLVED.map(row => [...row]) as Grid
    g[4][4] = 0
    expect(isComplete(g)).toBe(false)
  })

  it('returns false for a row with a duplicate', () => {
    const g = SOLVED.map(row => [...row]) as Grid
    // SOLVED[0][0] is 5, SOLVED[0][1] is 3 — change the 3 to 5
    g[0][1] = 5
    expect(isComplete(g)).toBe(false)
  })

  it('returns false for a column with a duplicate', () => {
    const g = SOLVED.map(row => [...row]) as Grid
    // SOLVED[0][0] is 5, SOLVED[1][0] is 6 — change the 6 to 5
    g[1][0] = 5
    expect(isComplete(g)).toBe(false)
  })

  it('returns false for a box with a duplicate', () => {
    const g = SOLVED.map(row => [...row]) as Grid
    // (0,0) is 5 and (1,1) is 7 — change (1,1) to 5 (same box)
    g[1][1] = 5
    expect(isComplete(g)).toBe(false)
  })
})