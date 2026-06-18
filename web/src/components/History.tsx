import { useEffect, useState, useMemo } from 'react'
import { useStorage } from '../game/storage'
import type { HistoryEntry, Difficulty } from '../game/types'
import './History.css'

interface HistoryProps {
  onBack: () => void
}

export function History({ onBack }: HistoryProps) {
  const storage = useStorage()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    storage
      .loadHistory()
      .then(setHistory)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [storage])

  const bestTimes = useMemo(() => computeBestTimes(history), [history])

  if (isLoading) {
    return (
      <div className="history">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="history">
        <p>Error: {error}</p>
        <button type="button" onClick={onBack}>← Menu</button>
      </div>
    )
  }

  return (
    <div className="history">
      <div className="history-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Menu
        </button>
        <h1>History</h1>
        <div className="spacer" />
      </div>

      <div className="best-row">
        {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
          <div key={d} className="best">
            <div className="best-label">Best {titleCase(d)}</div>
            <div className="best-time">
              {bestTimes[d] !== null ? formatTime(bestTimes[d]!) : '—'}
            </div>
          </div>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="empty">
          No completed games yet.
          <br />
          Finish a puzzle to see it here.
        </div>
      ) : (
        <ul className="entry-list">
          {history.map((entry, i) => (
            <li key={i} className="entry">
              <div>
                <div className="entry-diff">{titleCase(entry.difficulty)}</div>
                <div className="entry-date">{formatDate(entry.completedAt)}</div>
              </div>
              <div className="entry-time">{formatTime(entry.elapsedMs)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function computeBestTimes(
  history: HistoryEntry[],
): Record<Difficulty, number | null> {
  const best: Record<Difficulty, number | null> = {
    EASY: null,
    MEDIUM: null,
    HARD: null,
  }
  for (const entry of history) {
    const current = best[entry.difficulty]
    if (current === null || entry.elapsedMs < current) {
      best[entry.difficulty] = entry.elapsedMs
    }
  }
  return best
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const hours = Math.floor(minutes / 60)
  const mm = String(minutes % 60).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}