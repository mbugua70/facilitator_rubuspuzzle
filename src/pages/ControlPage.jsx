import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { puzzles } from '../data/puzzles'
import { apiUrl } from '../lib/api'

const puzzlesById = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]))

/**
 * Placeholder landing spot for a freshly created game. The full facilitator
 * control panel (start/pause/judge/skip, live timer, socket sync) is a
 * separate piece of work - this just confirms the game session exists and
 * shows its puzzle order.
 */
export function ControlPage() {
  const { gameCode } = useParams()
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      try {
        const response = await fetch(`${apiUrl}/api/game-sessions/${gameCode}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? 'Failed to load game session')
        }

        if (!cancelled) {
          setState(result.data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [gameCode])

  if (error) {
    return (
      <main>
        <h1>Game {gameCode}</h1>
        <p role="alert">{error}</p>
      </main>
    )
  }

  if (!state) {
    return (
      <main>
        <h1>Game {gameCode}</h1>
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Game {state.gameCode}</h1>
      <p>Status: {state.status}</p>
      <ol>
        {state.puzzleIds.map((puzzleId, index) => (
          <li key={`${puzzleId}-${index}`}>
            {puzzlesById.get(puzzleId)?.answer ?? puzzleId}
          </li>
        ))}
      </ol>
    </main>
  )
}
