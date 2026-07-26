import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activePuzzles } from '../data/puzzles'
import { apiUrl } from '../lib/api'
import './CreateGamePage.css'

function shuffle(list) {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function CreateGamePage() {
  const navigate = useNavigate()

  const allPuzzleIds = useMemo(() => activePuzzles.map((puzzle) => puzzle.id), [])
  const puzzlesById = useMemo(
    () => new Map(activePuzzles.map((puzzle) => [puzzle.id, puzzle])),
    [],
  )

  const [selectedPuzzleIds, setSelectedPuzzleIds] = useState(allPuzzleIds)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  function togglePuzzle(puzzleId) {
    setSelectedPuzzleIds((current) => {
      if (current.includes(puzzleId)) {
        return current.filter((id) => id !== puzzleId)
      }

      return [...current, puzzleId]
    })
  }

  function selectAll() {
    setSelectedPuzzleIds(allPuzzleIds)
  }

  function clearSelection() {
    setSelectedPuzzleIds([])
  }

  function shuffleSelected() {
    setSelectedPuzzleIds((current) => shuffle(current))
  }

  function movePuzzle(index, direction) {
    setSelectedPuzzleIds((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) {
        return current
      }

      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function removeFromOrder(puzzleId) {
    setSelectedPuzzleIds((current) => current.filter((id) => id !== puzzleId))
  }

  async function createGame() {
    if (selectedPuzzleIds.length === 0) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/api/game-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puzzleIds: selectedPuzzleIds,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'Failed to create game')
      }

      navigate(`/control/${result.data.gameCode}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="create-game-page">
      <header className="create-game-header">
        <h1>Create Picture Puzzle Game</h1>

        <p className="selection-count">
          {selectedPuzzleIds.length} of {activePuzzles.length} puzzles selected
        </p>

        <div className="header-actions">
          <button type="button" onClick={selectAll}>
            Select all
          </button>
          <button type="button" onClick={clearSelection}>
            Clear selection
          </button>
          <button
            type="button"
            onClick={shuffleSelected}
            disabled={selectedPuzzleIds.length < 2}
          >
            Shuffle order
          </button>
        </div>
      </header>

      <div className="create-game-body">
        <section aria-labelledby="catalogue-heading">
          <h2 id="catalogue-heading">All puzzles</h2>
          <ul className="puzzle-grid">
            {activePuzzles.map((puzzle) => {
              const selected = selectedPuzzleIds.includes(puzzle.id)

              return (
                <li key={puzzle.id}>
                  <button
                    type="button"
                    className="puzzle-card"
                    onClick={() => togglePuzzle(puzzle.id)}
                    aria-pressed={selected}
                  >
                    <span className="puzzle-card-images">
                      <img src={puzzle.leftImage} alt="" />
                      <img src={puzzle.rightImage} alt="" />
                    </span>
                    <span className="puzzle-answer">{puzzle.answer}</span>
                    <span className="puzzle-meta">
                      {puzzle.category} &middot; {puzzle.difficulty}
                    </span>
                    <span className="puzzle-state">
                      {selected ? 'Selected' : 'Not selected'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="order-heading">
          <h2 id="order-heading">Selected order</h2>
          {selectedPuzzleIds.length === 0 ? (
            <p>No puzzles selected yet.</p>
          ) : (
            <ol className="puzzle-order">
              {selectedPuzzleIds.map((puzzleId, index) => {
                const puzzle = puzzlesById.get(puzzleId)

                return (
                  <li key={puzzleId} className="puzzle-order-item">
                    <span className="order-index">{index + 1}</span>
                    <span className="order-answer">{puzzle.answer}</span>
                    <span className="order-controls">
                      <button
                        type="button"
                        onClick={() => movePuzzle(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${puzzle.answer} earlier`}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => movePuzzle(index, 1)}
                        disabled={index === selectedPuzzleIds.length - 1}
                        aria-label={`Move ${puzzle.answer} later`}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromOrder(puzzleId)}
                        aria-label={`Remove ${puzzle.answer}`}
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>

      {error && <p className="create-game-error" role="alert">{error}</p>}

      <button
        type="button"
        className="create-game-submit"
        disabled={selectedPuzzleIds.length === 0 || isCreating}
        onClick={createGame}
      >
        {isCreating
          ? 'Creating…'
          : `Create game with ${selectedPuzzleIds.length} puzzles`}
      </button>
    </main>
  )
}
