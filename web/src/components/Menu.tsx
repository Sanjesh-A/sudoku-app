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
            {savedGame.difficulty} · in progress
          </span>
        </button>
      )}
      <button type="button" className="menu-item" onClick={() => onNewGame('easy')}>
        <span className="menu-label">Easy</span>
        <span className="menu-desc">41 clues</span>
      </button>
      <button type="button" className="menu-item" onClick={() => onNewGame('medium')}>
        <span className="menu-label">Medium</span>
        <span className="menu-desc">33 clues</span>
      </button>
      <button type="button" className="menu-item" onClick={() => onNewGame('hard')}>
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