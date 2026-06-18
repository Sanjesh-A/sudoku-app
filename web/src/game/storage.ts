import { useCallback, useMemo } from 'react'
import { useApiClient, ApiError } from '../api/client'
import type {
  GameResponseDto,
  HistoryEntryDto,
  StartGameRequestDto,
  SaveGameRequestDto,
  CompleteGameRequestDto,
} from '../api/types'
import type { GameState, HistoryEntry, Difficulty, Grid } from './types'

/**
 * Hook providing storage operations backed by the API.
 * Each method returns a Promise; callers must await.
 */
export function useStorage() {
  const api = useApiClient()

  const loadCurrentGame = useCallback(async (): Promise<GameState | null> => {
    try {
      const dto = await api<GameResponseDto>('/api/games/active')
      return dtoToGameState(dto)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return null
      }
      throw e
    }
  }, [api])

  const startGame = useCallback(
    async (difficulty: Difficulty): Promise<GameState> => {
      const dto = await api<GameResponseDto>('/api/games', {
        method: 'POST',
        body: { difficulty } satisfies StartGameRequestDto,
      })
      return dtoToGameState(dto)
    },
    [api],
  )

  const saveCurrentGame = useCallback(
    async (state: GameState): Promise<void> => {
      await api<GameResponseDto>('/api/games/active', {
        method: 'PATCH',
        body: {
          entries: state.entries,
          notes: state.notes,
          elapsedMs: state.elapsedMs,
        } satisfies SaveGameRequestDto,
      })
    },
    [api],
  )

  const clearCurrentGame = useCallback(async (): Promise<void> => {
    try {
      await api('/api/games/active', { method: 'DELETE' })
    } catch (e) {
      // 404 means already cleared; not an error
      if (e instanceof ApiError && e.status === 404) return
      throw e
    }
  }, [api])

  const completeGame = useCallback(
    async (entries: number[][], elapsedMs: number): Promise<HistoryEntry> => {
      const dto = await api<HistoryEntryDto>('/api/games/active/complete', {
        method: 'POST',
        body: { entries, elapsedMs } satisfies CompleteGameRequestDto,
      })
      return dtoToHistoryEntry(dto)
    },
    [api],
  )

  const loadHistory = useCallback(async (): Promise<HistoryEntry[]> => {
    const dtos = await api<HistoryEntryDto[]>('/api/history')
    return dtos.map(dtoToHistoryEntry)
  }, [api])

  return useMemo(
    () => ({
      loadCurrentGame,
      startGame,
      saveCurrentGame,
      clearCurrentGame,
      completeGame,
      loadHistory,
    }),
    [
      loadCurrentGame,
      startGame,
      saveCurrentGame,
      clearCurrentGame,
      completeGame,
      loadHistory,
    ],
  )
}

function dtoToGameState(dto: GameResponseDto): GameState {
  return {
    difficulty: dto.difficulty,
    puzzle: dto.puzzle as Grid,
    entries: dto.entries as Grid,
    notes: dto.notes,
    elapsedMs: dto.elapsedMs,
    startedAt: new Date(dto.startedAt).getTime(),
  }
}

function dtoToHistoryEntry(dto: HistoryEntryDto): HistoryEntry {
  return {
    difficulty: dto.difficulty,
    elapsedMs: dto.elapsedMs,
    completedAt: new Date(dto.completedAt).getTime(),
  }
}