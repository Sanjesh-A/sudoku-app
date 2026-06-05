import { useState } from 'react'
import { Board } from './components/Board'
import { generatePuzzle } from './game/generator'
import type { GameState } from './game/types'

function createInitialGame(): GameState {
  const { puzzle, difficulty } = generatePuzzle('easy')
  return {
    difficulty,
    puzzle,
    entries: Array.from({ length: 9 }, () => Array(9).fill(0)),
    notes: Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => Array(9).fill(false)),
    ),
    elapsedMs: 0,
    startedAt: Date.now(),
  }
}

function App() {
  const [game] = useState<GameState>(createInitialGame)
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)

  return (
    <div className="app">
      <h1>Sudoku</h1>
      <Board
        puzzle={game.puzzle}
        entries={game.entries}
        notes={game.notes}
        selected={selected}
        onSelectCell={(row, col) => setSelected({ row, col })}
      />
    </div>
  )
}

export default App