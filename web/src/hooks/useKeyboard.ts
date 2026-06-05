import { useEffect } from 'react'
import type { Action } from '../state/gameReducer'
import type { CellValue } from '../game/types'

export function useKeyboard(dispatch: (action: Action) => void): void {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't capture keys when the user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key >= '1' && e.key <= '9') {
        dispatch({ type: 'inputNumber', value: parseInt(e.key, 10) as CellValue })
        e.preventDefault()
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        dispatch({ type: 'eraseCell' })
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        dispatch({ type: 'moveSelection', dRow: -1, dCol: 0 })
        e.preventDefault()
      } else if (e.key === 'ArrowDown') {
        dispatch({ type: 'moveSelection', dRow: 1, dCol: 0 })
        e.preventDefault()
      } else if (e.key === 'ArrowLeft') {
        dispatch({ type: 'moveSelection', dRow: 0, dCol: -1 })
        e.preventDefault()
      } else if (e.key === 'ArrowRight') {
        dispatch({ type: 'moveSelection', dRow: 0, dCol: 1 })
        e.preventDefault()
      } else if (e.key === 'n' || e.key === 'N') {
        dispatch({ type: 'toggleNotes' })
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [dispatch])
}