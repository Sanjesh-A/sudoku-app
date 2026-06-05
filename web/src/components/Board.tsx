import { Cell } from './Cell'
import type { CellHighlight } from './Cell'
import type { Grid, NotesGrid } from '../game/types'
import { hasConflict } from '../game/validator'
import './Board.css'

interface BoardProps {
  puzzle: Grid
  entries: Grid
  notes: NotesGrid
  selected: { row: number; col: number } | null
  onSelectCell: (row: number, col: number) => void
}

export function Board({
  puzzle,
  entries,
  notes,
  selected,
  onSelectCell,
}: BoardProps) {
  const selectedValue =
    selected !== null
      ? puzzle[selected.row][selected.col] || entries[selected.row][selected.col]
      : 0

  return (
    <div className="board">
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => {
          const given = puzzle[row][col] !== 0
          const value = given ? puzzle[row][col] : entries[row][col]
          const highlight = computeHighlight(row, col, selected, value, selectedValue)
          const error = !given && value !== 0 && hasConflict(
            mergedGrid(puzzle, entries),
            row,
            col,
            value,
          )

          return (
            <Cell
              key={`${row}-${col}`}
              value={value}
              given={given}
              highlight={highlight}
              error={error}
              notes={notes[row][col]}
              onClick={() => onSelectCell(row, col)}
            />
          )
        }),
      )}
    </div>
  )
}

function computeHighlight(
  row: number,
  col: number,
  selected: { row: number; col: number } | null,
  cellValue: number,
  selectedValue: number,
): CellHighlight {
  if (selected === null) return 'none'
  if (selected.row === row && selected.col === col) return 'selected'
  if (selectedValue !== 0 && cellValue === selectedValue) return 'same-value'
  const sameRow = selected.row === row
  const sameCol = selected.col === col
  const sameBox =
    Math.floor(selected.row / 3) === Math.floor(row / 3) &&
    Math.floor(selected.col / 3) === Math.floor(col / 3)
  if (sameRow || sameCol || sameBox) return 'related'
  return 'none'
}

function mergedGrid(puzzle: Grid, entries: Grid): Grid {
  return puzzle.map((row, r) => row.map((v, c) => (v !== 0 ? v : entries[r][c])))
}