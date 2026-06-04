export type Difficulty = 'easy' | 'medium' | 'hard'

export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type Grid = CellValue[][]

export interface Puzzle {
  /** The starting grid: zeros mark empty cells the player will fill in. */
  puzzle: Grid
  /** The valid solved grid used to create the puzzle. */
  solution: Grid
  difficulty: Difficulty
}

/**
 * Player's notes (pencil marks) for a cell: which of 1-9 the player has
 * marked as candidates. notes[r][c][n-1] is true if digit n is marked
 * in the cell at (r, c).
 */
export type NotesGrid = boolean[][][]

/**
 * The full state of an in-progress game, suitable for saving and resuming.
 */
export interface GameState {
  difficulty: Difficulty
  /** The starting clues. Zeros are cells the player fills in. */
  puzzle: Grid
  /** The player's entries, layered over the puzzle. Zeros are empty. */
  entries: Grid
  /** Pencil marks per cell. */
  notes: NotesGrid
  /** Total time spent so far, in milliseconds. */
  elapsedMs: number
  /** Wall-clock timestamp when the game was first started. */
  startedAt: number
}

/**
 * A completed game, recorded in history.
 */
export interface HistoryEntry {
  difficulty: Difficulty
  elapsedMs: number
  /** Wall-clock timestamp when the game was completed. */
  completedAt: number
}