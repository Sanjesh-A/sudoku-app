import type { GameState, Difficulty, CellValue } from '../game/types'
import { generatePuzzle } from '../game/generator'

export interface UiState {
  game: GameState
  selected: { row: number; col: number } | null
  notesMode: boolean
}

export type Action =
  | { type: 'selectCell'; row: number; col: number }
  | { type: 'inputNumber'; value: CellValue }
  | { type: 'eraseCell' }
  | { type: 'toggleNotes' }
  | { type: 'moveSelection'; dRow: number; dCol: number }
  | { type: 'startNewGame'; difficulty: Difficulty }
  | { type: 'tickTimer'; elapsedMs: number }

export function initialState(difficulty: Difficulty = 'easy'): UiState {
  const { puzzle } = generatePuzzle(difficulty)
  return {
    game: {
      difficulty,
      puzzle,
      entries: Array.from({ length: 9 }, () => Array(9).fill(0)),
      notes: Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => Array(9).fill(false)),
      ),
      elapsedMs: 0,
      startedAt: Date.now(),
    },
    selected: null,
    notesMode: false,
  }
}

export function gameReducer(state: UiState, action: Action): UiState {
  switch (action.type) {
    case 'selectCell':
      return { ...state, selected: { row: action.row, col: action.col } }

    case 'moveSelection': {
      if (state.selected === null) {
        return { ...state, selected: { row: 0, col: 0 } }
      }
      const row = clamp(state.selected.row + action.dRow, 0, 8)
      const col = clamp(state.selected.col + action.dCol, 0, 8)
      return { ...state, selected: { row, col } }
    }

    case 'inputNumber': {
      if (state.selected === null) return state
      const { row, col } = state.selected
      // Can't modify a given cell
      if (state.game.puzzle[row][col] !== 0) return state

      if (state.notesMode) {
        const notes = cloneNotes(state.game.notes)
        notes[row][col][action.value - 1] = !notes[row][col][action.value - 1]
        return { ...state, game: { ...state.game, notes } }
      }

      const entries = cloneGrid(state.game.entries)
      // Toggle off if same value, otherwise set
      entries[row][col] = entries[row][col] === action.value ? 0 : action.value
      // Setting a value clears notes in that cell
      const notes = cloneNotes(state.game.notes)
      if (entries[row][col] !== 0) {
        notes[row][col] = Array(9).fill(false)
      }
      return { ...state, game: { ...state.game, entries, notes } }
    }

    case 'eraseCell': {
      if (state.selected === null) return state
      const { row, col } = state.selected
      if (state.game.puzzle[row][col] !== 0) return state
      const entries = cloneGrid(state.game.entries)
      const notes = cloneNotes(state.game.notes)
      entries[row][col] = 0
      notes[row][col] = Array(9).fill(false)
      return { ...state, game: { ...state.game, entries, notes } }
    }

    case 'toggleNotes':
      return { ...state, notesMode: !state.notesMode }

    case 'startNewGame':
      return initialState(action.difficulty)

    case 'tickTimer':
      return { ...state, game: { ...state.game, elapsedMs: action.elapsedMs } }
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function cloneGrid<T>(grid: T[][]): T[][] {
  return grid.map(row => [...row])
}

function cloneNotes(notes: boolean[][][]): boolean[][][] {
  return notes.map(row => row.map(cell => [...cell]))
}