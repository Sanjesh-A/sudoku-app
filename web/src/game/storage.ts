import type { GameState, HistoryEntry } from './types'

const KEY_CURRENT_GAME = 'sudoku:currentGame'
const KEY_HISTORY = 'sudoku:history'
const MAX_HISTORY_ENTRIES = 100

/**
 * Saves the current in-progress game. Overwrites any existing saved game.
 * Silently fails if localStorage is unavailable (e.g., private browsing
 * mode in some browsers).
 */
export function saveCurrentGame(state: GameState): void {
  try {
    localStorage.setItem(KEY_CURRENT_GAME, JSON.stringify(state))
  } catch {
    // localStorage may throw QuotaExceededError or be unavailable.
    // Treat as a no-op; the caller's UI state is unaffected.
  }
}

/**
 * Loads the saved in-progress game, or null if there isn't one or
 * the saved data is unreadable.
 */
export function loadCurrentGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY_CURRENT_GAME)
    if (raw === null) return null
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}

/**
 * Clears the saved in-progress game. Typically called when a game
 * is completed or abandoned.
 */
export function clearCurrentGame(): void {
  try {
    localStorage.removeItem(KEY_CURRENT_GAME)
  } catch {
    // No-op
  }
}

/**
 * Returns all history entries, newest first.
 * Returns an empty array if there's no history or the saved data
 * is unreadable.
 */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY_HISTORY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as HistoryEntry[]
  } catch {
    return []
  }
}

/**
 * Appends an entry to history (newest first) and persists.
 * Caps history at MAX_HISTORY_ENTRIES to avoid unbounded growth.
 */
export function addHistoryEntry(entry: HistoryEntry): void {
  const existing = loadHistory()
  const updated = [entry, ...existing].slice(0, MAX_HISTORY_ENTRIES)
  try {
    localStorage.setItem(KEY_HISTORY, JSON.stringify(updated))
  } catch {
    // No-op
  }
}