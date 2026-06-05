import { useReducer } from 'react'
import { Board } from './components/Board'
import { NumberPad } from './components/NumberPad'
import { Controls } from './components/Controls'
import { gameReducer, initialState } from './state/gameReducer'
import { useKeyboard } from './hooks/useKeyboard'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState('easy'))

  useKeyboard(dispatch)

  return (
    <div className="app">
      <h1>Sudoku</h1>
      <Board
        puzzle={state.game.puzzle}
        entries={state.game.entries}
        notes={state.game.notes}
        selected={state.selected}
        onSelectCell={(row, col) => dispatch({ type: 'selectCell', row, col })}
      />
      <NumberPad
        puzzle={state.game.puzzle}
        entries={state.game.entries}
        onInput={value => dispatch({ type: 'inputNumber', value })}
      />
      <Controls
        notesMode={state.notesMode}
        onToggleNotes={() => dispatch({ type: 'toggleNotes' })}
        onErase={() => dispatch({ type: 'eraseCell' })}
      />
    </div>
  )
}

export default App