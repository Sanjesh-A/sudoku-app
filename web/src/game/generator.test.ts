import { describe, it, expect } from 'vitest'
import { generateSolution, generatePuzzle } from './generator'
import type { Grid, Difficulty } from './types'

/** Returns true if every row, column, and 3x3 box contains exactly 1-9. */
function isValidSolution(grid: Grid): boolean {
  for (let i = 0; i < 9; i++) {
    const rowValues = new Set(grid[i])
    const colValues = new Set(grid.map(row => row[i]))
    if (rowValues.size !== 9 || colValues.size !== 9) return false
    if (rowValues.has(0) || colValues.has(0)) return false
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const boxValues = new Set<number>()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          boxValues.add(grid[br * 3 + i][bc * 3 + j])
        }
      }
      if (boxValues.size !== 9 || boxValues.has(0)) return false
    }
  }
  return true
}

/** Counts non-zero cells in a grid. */
function clueCount(grid: Grid): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== 0) count++
    }
  }
  return count
}

describe('generateSolution', () => {
  it('produces a 9x9 grid', () => {
    const grid = generateSolution()
    expect(grid).toHaveLength(9)
    grid.forEach(row => expect(row).toHaveLength(9))
  })

  it('produces a valid sudoku solution', () => {
    const grid = generateSolution()
    expect(isValidSolution(grid)).toBe(true)
  })

  it('produces different grids on each call', () => {
    const a = generateSolution()
    const b = generateSolution()
    expect(a).not.toEqual(b)
  })
})

describe('generatePuzzle', () => {
  const cases: Array<{ difficulty: Difficulty; expectedClues: number }> = [
    { difficulty: 'EASY', expectedClues: 41 },
    { difficulty: 'MEDIUM', expectedClues: 33 },
    { difficulty: 'HARD', expectedClues: 27 },
  ]

  cases.forEach(({ difficulty, expectedClues }) => {
    describe(difficulty, () => {
      it(`leaves ${expectedClues} clues`, () => {
        const { puzzle } = generatePuzzle(difficulty)
        expect(clueCount(puzzle)).toBe(expectedClues)
      })

      it('has a valid underlying solution', () => {
        const { solution } = generatePuzzle(difficulty)
        expect(isValidSolution(solution)).toBe(true)
      })

      it('is consistent with its solution (every clue matches)', () => {
        const { puzzle, solution } = generatePuzzle(difficulty)
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (puzzle[r][c] !== 0) {
              expect(puzzle[r][c]).toBe(solution[r][c])
            }
          }
        }
      })

      it('echoes back the requested difficulty', () => {
        const result = generatePuzzle(difficulty)
        expect(result.difficulty).toBe(difficulty)
      })
    })
  })
})