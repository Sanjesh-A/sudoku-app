import { useEffect, useReducer, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Board } from './components/Board'
import { NumberPad } from './components/NumberPad'
import { Controls } from './components/Controls'
import { Timer, type TimerHandle } from './components/Timer'
import { Menu } from './components/Menu'
import { WinScreen } from './components/WinScreen'
import { History } from './components/History'
import { LoginScreen } from './components/LoginScreen'
import { UserMenu } from './components/UserMenu'
import { gameReducer, initialState } from './state/gameReducer'
import { useKeyboard } from './hooks/useKeyboard'
import { useStorage } from './game/storage'
import type { GameState } from './game/types'

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
  const [savedGame, setSavedGame] = useState<GameState | null>(null)
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<TimerHandle | null>(null)
  const storage = useStorage()

  // Show the loading state as soon as we transition into the menu, without
  // setting state synchronously inside the fetch effect.
  const [prevView, setPrevView] = useState(state.view)
  if (prevView !== state.view) {
    setPrevView(state.view)
    if (state.view === 'menu') setIsLoadingMenu(true)
  }

  // On menu entry, refresh saved game state from server
  useEffect(() => {
    if (state.view !== 'menu') return
    storage
      .loadCurrentGame()
      .then(setSavedGame)
      .catch((e) => setError(`Failed to load: ${e.message}`))
      .finally(() => setIsLoadingMenu(false))
  }, [state.view, storage])

  // Persist on changes when in game view
  useEffect(() => {
    if (state.view !== 'game' || state.game === null) return
    storage.saveCurrentGame(state.game).catch((e) => {
      console.warn('Failed to save:', e)
    })
  }, [state.game, state.view, storage])

  useKeyboard(state.view === 'game' ? dispatch : noop)

  const goToMenu = () => {
    const finalElapsedMs = timerRef.current?.getElapsedMs()
    dispatch({ type: 'goToMenu', finalElapsedMs })
  }

  const handleNewGame = async (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    setError(null)
    try {
      const game = await storage.startGame(difficulty)
      dispatch({ type: 'resumeGame', game })
    } catch (e) {
      setError(`Failed to start game: ${(e as Error).message}`)
    }
  }

  const handleResume = () => {
    if (savedGame !== null) {
      dispatch({ type: 'resumeGame', game: savedGame })
    }
  }

  // Win detection
  useEffect(() => {
    if (state.view !== 'game' || state.game === null) return
    const merged = state.game.puzzle.map((row, r) =>
      row.map((v, c) => (v !== 0 ? v : state.game!.entries[r][c])),
    )
    if (!isGridComplete(merged)) return

    const finalElapsedMs = timerRef.current?.getElapsedMs() ?? state.game.elapsedMs
    storage
      .completeGame(state.game.entries, finalElapsedMs)
      .then(() => {
        dispatch({ type: 'completeGame', finalElapsedMs })
      })
      .catch((e) => {
        setError(`Completion failed: ${e.message}`)
      })
  }, [state.game, state.view, storage])

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      {state.view === 'menu' && (
        <>
          <div className="app-header">
            <h1>Sudoku</h1>
            <UserMenu />
          </div>
          {isLoadingMenu ? (
            <p>Loading...</p>
          ) : (
            <Menu
              savedGame={savedGame}
              onResume={handleResume}
              onNewGame={handleNewGame}
              onHistory={() => dispatch({ type: 'goToHistory' })}
            />
          )}
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
          onPlayAgain={() => handleNewGame(state.lastWin!.difficulty)}
        />
      )}

      {state.view === 'history' && (
        <History onBack={() => dispatch({ type: 'goToMenu' })} />
      )}
    </div>
  )
}

function isGridComplete(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false
    }
  }
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set<number>()
    const colSet = new Set<number>()
    for (let j = 0; j < 9; j++) {
      rowSet.add(grid[i][j])
      colSet.add(grid[j][i])
    }
    if (rowSet.size !== 9 || colSet.size !== 9) return false
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const boxSet = new Set<number>()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          boxSet.add(grid[br * 3 + i][bc * 3 + j])
        }
      }
      if (boxSet.size !== 9) return false
    }
  }
  return true
}

function noop() {}

export default App