import type { Difficulty, GameState } from '../game/types'
import './Menu.css'

interface MenuProps {
  savedGame: GameState | null
  onResume: () => void
  onNewGame: (difficulty: Difficulty) => void
  onHistory: () => void
}

export function Menu({ savedGame, onResume, onNewGame, onHistory }: MenuProps) {
  return (
    <div className="menu">
      {savedGame !== null && (
        <button type="button" className="menu-item continue" onClick={onResume}>
          <span className="menu-label">Continue game</span>
          <span className="menu-desc">
            {titleCase(savedGame.difficulty)} · in progress
          </span>
        </button>
      )}
      <button type="button" className="menu-item" onClick={() => onNewGame('EASY')}>
        <span className="menu-label">Easy</span>
        <span className="menu-desc">41 clues</span>
      </button>
      <button type="button" className="menu-item" onClick={() => onNewGame('MEDIUM')}>
        <span className="menu-label">Medium</span>
        <span className="menu-desc">33 clues</span>
      </button>
      <button type="button" className="menu-item" onClick={() => onNewGame('HARD')}>
        <span className="menu-label">Hard</span>
        <span className="menu-desc">27 clues</span>
      </button>
      <button type="button" className="menu-item" onClick={onHistory}>
        <span className="menu-label">History</span>
        <span className="menu-desc">View completed games</span>
      </button>
    </div>
  )
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}