import { useReducer, useRef } from 'react'
import { Board } from './components/Board'
import { NumberPad } from './components/NumberPad'
import { Controls } from './components/Controls'
import { Timer, type TimerHandle } from './components/Timer'
import { Menu } from './components/Menu'
import { WinScreen } from './components/WinScreen'
import { gameReducer, initialState } from './state/gameReducer'
import { useKeyboard } from './hooks/useKeyboard'
import { useWinDetection } from './hooks/useWinDetection'
import { usePersistence } from './hooks/usePersistence'
import { loadCurrentGame, addHistoryEntry } from './game/storage'
import { History } from './components/History'
import { useAuth0 } from '@auth0/auth0-react'
import { LoginScreen } from './components/LoginScreen'
import { UserMenu } from './components/UserMenu'

function App() {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div className="app"><p>Loading...</p></div>
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <AuthenticatedApp />
}

function AuthenticatedApp() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState)
  const timerRef = useRef<TimerHandle | null>(null)

  useKeyboard(state.view === 'game' ? dispatch : noop)

  usePersistence(state.game)

  useWinDetection(state.game, () => {
    if (state.game === null) return
    const finalElapsedMs = timerRef.current?.getElapsedMs() ?? state.game.elapsedMs
    addHistoryEntry({
      difficulty: state.game.difficulty,
      elapsedMs: finalElapsedMs,
      completedAt: Date.now(),
    })
    dispatch({ type: 'completeGame', finalElapsedMs })
  })

  const goToMenu = () => {
    const finalElapsedMs = timerRef.current?.getElapsedMs()
    dispatch({ type: 'goToMenu', finalElapsedMs })
  }

  return (
    <div className="app">
      {state.view === 'menu' && (
        <>
          <div className="app-header">
            <h1>Sudoku</h1>
            <UserMenu />
          </div>
          <Menu
            savedGame={loadCurrentGame()}
            onResume={() => {
              const saved = loadCurrentGame()
              if (saved !== null) {
                dispatch({ type: 'resumeGame', game: saved })
              }
            }}
            onNewGame={(difficulty) => dispatch({ type: 'startNewGame', difficulty })}
            onHistory={() => dispatch({ type: 'goToHistory' })}
          />
        </>
      )}

      {state.view === 'game' && state.game !== null && (
        <>
          <div className="game-header">
            <button type="button" className="back-btn" onClick={goToMenu}>
              ← Menu
            </button>
            <span className="game-difficulty">{state.game.difficulty}</span>
            <Timer ref={timerRef} baseMs={state.game.elapsedMs} running={true} />
          </div>
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
            onInput={(value) => dispatch({ type: 'inputNumber', value })}
          />
          <Controls
            notesMode={state.notesMode}
            onToggleNotes={() => dispatch({ type: 'toggleNotes' })}
            onErase={() => dispatch({ type: 'eraseCell' })}
          />
        </>
      )}

      {state.view === 'win' && state.lastWin !== null && (
        <WinScreen
          difficulty={state.lastWin.difficulty}
          elapsedMs={state.lastWin.elapsedMs}
          onMenu={() => dispatch({ type: 'goToMenu' })}
          onPlayAgain={() =>
            dispatch({ type: 'startNewGame', difficulty: state.lastWin!.difficulty })
          }
        />
      )}

      {state.view === 'history' && (
        <History onBack={() => dispatch({ type: 'goToMenu' })} />
      )}
    </div>
  )
}

function noop() {}

export default App