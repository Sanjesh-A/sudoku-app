import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './Timer.css'

export interface TimerHandle {
  /** Returns the live elapsed time in milliseconds. */
  getElapsedMs: () => number
}

interface TimerProps {
  /** Elapsed time accumulated before this session, in ms. */
  baseMs: number
  /** Whether the timer should be running. */
  running: boolean
}

export const Timer = forwardRef<TimerHandle, TimerProps>(function Timer(
  { baseMs, running },
  ref,
) {
  const [, forceRender] = useState(0)
  const startedAtRef = useRef<number>(Date.now())

  // Reset the session start whenever baseMs or running changes
  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [baseMs, running])

  // Re-render once per second while running
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => forceRender((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const elapsedMs = running
    ? baseMs + (Date.now() - startedAtRef.current)
    : baseMs

  useImperativeHandle(
    ref,
    () => ({
      getElapsedMs: () =>
        running ? baseMs + (Date.now() - startedAtRef.current) : baseMs,
    }),
    [baseMs, running],
  )

  return <div className="timer">{formatTime(elapsedMs)}</div>
})

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const hours = Math.floor(minutes / 60)
  const mm = String(minutes % 60).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}