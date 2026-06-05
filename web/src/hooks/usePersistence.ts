import { useEffect } from 'react'
import type { GameState } from '../game/types'
import { saveCurrentGame, clearCurrentGame } from '../game/storage'

/**
 * Persists the active game to localStorage whenever it changes.
 * Clears the saved game when there's no active game.
 */
export function usePersistence(game: GameState | null): void {
  useEffect(() => {
    if (game === null) {
      clearCurrentGame()
    } else {
      saveCurrentGame(game)
    }
  }, [game])
}