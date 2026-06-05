import './Controls.css'

interface ControlsProps {
  notesMode: boolean
  onToggleNotes: () => void
  onErase: () => void
}

export function Controls({ notesMode, onToggleNotes, onErase }: ControlsProps) {
  return (
    <div className="controls">
      <button
        type="button"
        className={`control${notesMode ? ' active' : ''}`}
        onClick={onToggleNotes}
      >
        Notes {notesMode ? 'on' : 'off'}
      </button>
      <button type="button" className="control" onClick={onErase}>
        Erase
      </button>
    </div>
  )
}