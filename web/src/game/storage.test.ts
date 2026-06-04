import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { GameState, HistoryEntry } from './types'

// In-memory localStorage substitute, installed before importing storage.
class MemoryStorage {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

const memory = new MemoryStorage()
vi.stubGlobal('localStorage', memory)

// Now import the module under test — it'll use our stub.
const {
  saveCurrentGame,
  loadCurrentGame,
  clearCurrentGame,
  loadHistory,
  addHistoryEntry,
} = await import('./storage')

function sampleGameState(): GameState {
  return {
    difficulty: 'medium',
    puzzle: Array.from({ length: 9 }, () => Array(9).fill(0)),
    entries: Array.from({ length: 9 }, () => Array(9).fill(0)),
    notes: Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => Array(9).fill(false)),
    ),
    elapsedMs: 12_345,
    startedAt: 1_700_000_000_000,
  }
}

function sampleHistoryEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    difficulty: 'easy',
    elapsedMs: 60_000,
    completedAt: 1_700_000_000_000,
    ...overrides,
  }
}

beforeEach(() => {
  memory.clear()
})

describe('saveCurrentGame / loadCurrentGame', () => {
  it('returns null when nothing is saved', () => {
    expect(loadCurrentGame()).toBeNull()
  })

  it('round-trips a game state', () => {
    const state = sampleGameState()
    saveCurrentGame(state)
    expect(loadCurrentGame()).toEqual(state)
  })

  it('overwrites previous saves', () => {
    saveCurrentGame(sampleGameState())
    const updated = { ...sampleGameState(), elapsedMs: 99_999 }
    saveCurrentGame(updated)
    expect(loadCurrentGame()?.elapsedMs).toBe(99_999)
  })

  it('returns null when stored data is unparseable', () => {
    localStorage.setItem('sudoku:currentGame', 'not json')
    expect(loadCurrentGame()).toBeNull()
  })
})

describe('clearCurrentGame', () => {
  it('removes the saved game', () => {
    saveCurrentGame(sampleGameState())
    clearCurrentGame()
    expect(loadCurrentGame()).toBeNull()
  })

  it('is a no-op when nothing is saved', () => {
    expect(() => clearCurrentGame()).not.toThrow()
  })
})

describe('loadHistory / addHistoryEntry', () => {
  it('starts empty', () => {
    expect(loadHistory()).toEqual([])
  })

  it('appends entries with the newest first', () => {
    addHistoryEntry(sampleHistoryEntry({ completedAt: 1000 }))
    addHistoryEntry(sampleHistoryEntry({ completedAt: 2000 }))
    addHistoryEntry(sampleHistoryEntry({ completedAt: 3000 }))
    const history = loadHistory()
    expect(history.map(h => h.completedAt)).toEqual([3000, 2000, 1000])
  })

  it('returns an empty array when stored data is unparseable', () => {
    localStorage.setItem('sudoku:history', 'not json')
    expect(loadHistory()).toEqual([])
  })

  it('returns an empty array when stored data is not an array', () => {
    localStorage.setItem('sudoku:history', '{"not": "an array"}')
    expect(loadHistory()).toEqual([])
  })

  it('caps history at 100 entries', () => {
    for (let i = 0; i < 150; i++) {
      addHistoryEntry(sampleHistoryEntry({ completedAt: i }))
    }
    const history = loadHistory()
    expect(history).toHaveLength(100)
    // Newest first; the most recently added is completedAt: 149
    expect(history[0].completedAt).toBe(149)
    // Oldest kept is completedAt: 50 (we dropped 0-49)
    expect(history[99].completedAt).toBe(50)
  })
})