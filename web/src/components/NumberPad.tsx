import type { CellValue, Grid } from '../game/types'
import './NumberPad.css'

interface NumberPadProps {
  puzzle: Grid
  entries: Grid
  onInput: (value: CellValue) => void
}

export function NumberPad({ puzzle, entries, onInput }: NumberPadProps) {
  const counts = countValues(puzzle, entries)
  const digits: CellValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="numpad">
      {digits.map(n => {
        const done = counts[n] === 9
        return (
          <button
            key={n}
            type="button"
            className={`numpad-key${done ? ' done' : ''}`}
            onClick={() => onInput(n)}
            disabled={done}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

function countValues(puzzle: Grid, entries: Grid): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = puzzle[r][c] || entries[r][c]
      if (v !== 0) counts[v]++
    }
  }
  return counts
}