import type { CellValue } from '../game/types'
import './Cell.css'

export type CellHighlight = 'selected' | 'same-value' | 'related' | 'none'

interface CellProps {
  value: CellValue
  given: boolean
  highlight: CellHighlight
  error: boolean
  notes: boolean[]
  onClick: () => void
}

export function Cell({
  value,
  given,
  highlight,
  error,
  notes,
  onClick,
}: CellProps) {
  const classes = ['cell']
  if (given) classes.push('given')
  else if (value !== 0) classes.push('user')
  if (highlight !== 'none') classes.push(highlight)
  if (error) classes.push('error')

  const hasNotes = value === 0 && notes.some(Boolean)

  return (
    <button type="button" className={classes.join(' ')} onClick={onClick}>
      {value !== 0 ? (
        value
      ) : hasNotes ? (
        <div className="notes" aria-hidden="true">
          {notes.map((on, i) => (
            <span key={i}>{on ? i + 1 : ''}</span>
          ))}
        </div>
      ) : null}
    </button>
  )
}