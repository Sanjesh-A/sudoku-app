import type { Difficulty } from '../game/types'
import './WinScreen.css'

interface WinScreenProps {
  difficulty: Difficulty
  elapsedMs: number
  onMenu: () => void
  onPlayAgain: () => void
}

export function WinScreen({ difficulty, elapsedMs, onMenu, onPlayAgain }: WinScreenProps) {
  return (
    <div className="win">
      <div className="win-card">
        <h2>Puzzle complete</h2>
        <p>
          {titleCase(difficulty)} · {formatTime(elapsedMs)}
        </p>
      </div>
      <div className="win-actions">
        <button type="button" className="win-action primary" onClick={onMenu}>
          Back to menu
        </button>
        <button type="button" className="win-action" onClick={onPlayAgain}>
          New {titleCase(difficulty)} game
        </button>
      </div>
    </div>
  )
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const hours = Math.floor(minutes / 60)
  const mm = String(minutes % 60).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}