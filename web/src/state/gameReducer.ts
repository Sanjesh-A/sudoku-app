import type { GameState, Difficulty, CellValue } from '../game/types'
import { generatePuzzle } from '../game/generator'

export type View = 'menu' | 'game' | 'history' | 'win'

export interface UiState {
  view: View
  game: GameState | null
  selected: { row: number; col: number } | null
  notesMode: boolean
  lastWin: { difficulty: Difficulty; elapsedMs: number } | null
}

export type Action =
  | { type: 'selectCell'; row: number; col: number }
  | { type: 'inputNumber'; value: CellValue }
  | { type: 'eraseCell' }
  | { type: 'toggleNotes' }
  | { type: 'moveSelection'; dRow: number; dCol: number }
  | { type: 'startNewGame'; difficulty: Difficulty }
  | { type: 'resumeGame'; game: GameState }
  | { type: 'completeGame'; finalElapsedMs: number }
  | { type: 'goToMenu'; finalElapsedMs?: number }
  | { type: 'goToHistory' }

export function initialState(): UiState {
  return {
    view: 'menu',
    game: null,
    selected: null,
    notesMode: false,
    lastWin: null,
  }
}

function newGameState(difficulty: Difficulty): GameState {
  const { puzzle } = generatePuzzle(difficulty)
  return {
    difficulty,
    puzzle,
    entries: Array.from({ length: 9 }, () => Array(9).fill(0)),
    notes: Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => Array(9).fill(false)),
    ),
    elapsedMs: 0,
    startedAt: Date.now(),
  }
}

export function gameReducer(state: UiState, action: Action): UiState {
  switch (action.type) {
    case 'startNewGame':
      return {
        view: 'game',
        game: newGameState(action.difficulty),
        selected: null,
        notesMode: false,
        lastWin: null,
      }

    case 'resumeGame':
      return {
        view: 'game',
        game: action.game,
        selected: null,
        notesMode: false,
        lastWin: null,
      }

    case 'goToHistory':
      return { ...state, view: 'history' }

    case 'completeGame': {
      if (state.game === null) return state
      return {
        ...state,
        view: 'win',
        lastWin: {
          difficulty: state.game.difficulty,
          elapsedMs: action.finalElapsedMs,
        },
        game: null,
        selected: null,
        notesMode: false,
      }
    }

    case 'goToMenu':
      if (state.game !== null && action.finalElapsedMs !== undefined) {
        return {
          ...state,
          view: 'menu',
          game: { ...state.game, elapsedMs: action.finalElapsedMs },
          selected: null,
        }
      }
      return { ...state, view: 'menu', selected: null }

    case 'selectCell':
      if (state.game === null) return state
      return { ...state, selected: { row: action.row, col: action.col } }

    case 'moveSelection': {
      if (state.game === null) return state
      if (state.selected === null) {
        return { ...state, selected: { row: 0, col: 0 } }
      }
      const row = clamp(state.selected.row + action.dRow, 0, 8)
      const col = clamp(state.selected.col + action.dCol, 0, 8)
      return { ...state, selected: { row, col } }
    }

    case 'inputNumber': {
      if (state.game === null || state.selected === null) return state
      const { row, col } = state.selected
      if (state.game.puzzle[row][col] !== 0) return state

      if (state.notesMode) {
        const notes = cloneNotes(state.game.notes)
        notes[row][col][action.value - 1] = !notes[row][col][action.value - 1]
        return { ...state, game: { ...state.game, notes } }
      }

      const entries = cloneGrid(state.game.entries)
      entries[row][col] = entries[row][col] === action.value ? 0 : action.value
      const notes = cloneNotes(state.game.notes)
      if (entries[row][col] !== 0) {
        notes[row][col] = Array(9).fill(false)
      }
      return { ...state, game: { ...state.game, entries, notes } }
    }

    case 'eraseCell': {
      if (state.game === null || state.selected === null) return state
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