import { useEffect, useRef } from 'react'
import type { GameState } from '../game/types'
import { isComplete } from '../game/validator'

/**
 * Watches the game state and fires `onWin` when the puzzle is complete.
 */
export function useWinDetection(
  game: GameState | null,
  onWin: () => void,
): void {
  const onWinRef = useRef(onWin)
  useEffect(() => {
    onWinRef.current = onWin
  })

  useEffect(() => {
    if (game === null) return
    const merged = game.puzzle.map((row, r) =>
      row.map((v, c) => (v !== 0 ? v : game.entries[r][c])),
    )
    if (isComplete(merged)) {
      onWinRef.current()
    }
  }, [game])
}