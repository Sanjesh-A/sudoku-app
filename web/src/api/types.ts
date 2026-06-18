import type { Difficulty } from '../game/types'

export interface GameResponseDto {
  id: string
  difficulty: Difficulty
  puzzle: number[][]
  entries: number[][]
  notes: boolean[][][]
  elapsedMs: number
  startedAt: string
  updatedAt: string
}

export interface HistoryEntryDto {
  id: string
  difficulty: Difficulty
  elapsedMs: number
  completedAt: string
}

export interface StartGameRequestDto {
  difficulty: Difficulty
}

export interface SaveGameRequestDto {
  entries: number[][]
  notes: boolean[][][]
  elapsedMs: number
}

export interface CompleteGameRequestDto {
  entries: number[][]
  elapsedMs: number
}