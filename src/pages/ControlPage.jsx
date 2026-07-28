import { Link, useParams } from 'react-router-dom'
import { puzzles } from '../data/puzzles'
import { useFacilitatorSocket } from '../hooks/useFacilitatorSocket'
import { useCountdown } from '../hooks/useCountdown'
import './ControlPage.css'

const puzzlesById = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]))

function StatusBadge({ status }) {
  return <span className="status-badge">{status}</span>
}

function StatsRow({ state }) {
  return (
    <div className="stats-row">
      <div className="stat">
        <span className="stat-value">{state.score}</span>
        <span className="stat-label">Score</span>
      </div>
      <div className="stat">
        <span className="stat-value">{state.correctCount}</span>
        <span className="stat-label">Correct</span>
      </div>
      <div className="stat">
        <span className="stat-value">{state.wrongCount}</span>
        <span className="stat-label">Wrong</span>
      </div>
      <div className="stat">
        <span className="stat-value">{state.skippedCount}</span>
        <span className="stat-label">Skipped</span>
      </div>
      <div className="stat">
        <span className="stat-value">{state.timeoutCount}</span>
        <span className="stat-label">Timed out</span>
      </div>
    </div>
  )
}

function PuzzlePanel({ puzzle, timeRemaining, showTimer }) {
  if (!puzzle) return null

  return (
    <>
      <div className="puzzle-panel">
        <div className="puzzle-panel-images">
          <img src={puzzle.leftImage} alt="" />
          <img src={puzzle.rightImage} alt="" />
        </div>
        <div className="puzzle-panel-body">
          <div className="puzzle-panel-answer">{puzzle.answer}</div>
          <div className="puzzle-panel-hint">
            {puzzle.componentWords.join(' + ')} &middot; {puzzle.hint}
          </div>
        </div>
      </div>
      {showTimer && <div className="timer">{Math.ceil(timeRemaining)}s</div>}
    </>
  )
}

function PuzzleOrder({ puzzleIds, currentPuzzleIndex }) {
  return (
    <ol className="puzzle-order">
      {puzzleIds.map((puzzleId, index) => (
        <li key={`${puzzleId}-${index}`} className="puzzle-order-item" data-current={index === currentPuzzleIndex}>
          <span className="order-index">{index + 1}.</span>
          <span>{puzzlesById.get(puzzleId)?.answer ?? puzzleId}</span>
        </li>
      ))}
    </ol>
  )
}

function Actions({ state, actions }) {
  const { status, currentPuzzleAnswered } = state

  return (
    <div className="actions">
      {status === 'waiting' && (
        <button type="button" className="action-button" onClick={actions.start}>
          Start Game
        </button>
      )}

      {status === 'playing' && (
        <>
          <button type="button" className="action-button correct" onClick={actions.judgeCorrect} disabled={currentPuzzleAnswered}>
            Correct
          </button>
          <button type="button" className="action-button wrong" onClick={actions.judgeWrong} disabled={currentPuzzleAnswered}>
            Wrong
          </button>
          <button type="button" className="action-button" onClick={actions.skip}>
            Skip
          </button>
          <button type="button" className="action-button" onClick={actions.pause}>
            Pause
          </button>
        </>
      )}

      {status === 'correct' && (
        <button type="button" className="action-button" onClick={actions.skip}>
          Next Puzzle
        </button>
      )}

      {(status === 'wrong' || status === 'timeout') && (
        <>
          <button type="button" className="action-button" onClick={actions.retry}>
            Next Person (same puzzle)
          </button>
          <button type="button" className="action-button" onClick={actions.skip}>
            Next Puzzle
          </button>
        </>
      )}

      {status === 'paused' && (
        <button type="button" className="action-button" onClick={actions.resume}>
          Resume
        </button>
      )}

      {status !== 'waiting' && (
        <button type="button" className="action-button danger" onClick={actions.restart}>
          Restart
        </button>
      )}

      {!['waiting', 'finished'].includes(status) && (
        <button type="button" className="action-button danger" onClick={actions.end}>
          End Game
        </button>
      )}
    </div>
  )
}

/**
 * Real facilitator control panel: connects over Socket.IO as `facilitator`,
 * rejoins on every reconnect, and drives the backend's authoritative game
 * state via game:start/judge/skip/retry/pause/resume/restart/end. The TV
 * display only ever reflects whatever this page (or another facilitator
 * client) tells the backend to do.
 *
 * On "correct" the puzzle advances (game:skip). On "wrong"/"timeout" the
 * facilitator chooses: retry the same puzzle for the next player in line
 * (game:retry - same puzzle, fresh timer), or give up on it and move on
 * anyway (game:skip) - it's never a hard requirement that the puzzle gets
 * solved before the game moves forward.
 */
export function ControlPage() {
  const { gameCode } = useParams()
  const { gameState, connectionStatus, error, hasSyncedOnce, actions, actionError } = useFacilitatorSocket(gameCode)
  const timeRemaining = useCountdown({
    questionEndsAt: gameState?.questionEndsAt ?? null,
    isPaused: gameState?.status === 'paused',
  })

  if (!hasSyncedOnce && connectionStatus === 'error') {
    return (
      <main className="control-page">
        <Link to="/" className="new-game-link" state={{ fromGameCode: gameCode }}>
          &larr; New Game
        </Link>
        <h1>Game {gameCode}</h1>
        <p role="alert">{error}</p>
      </main>
    )
  }

  if (!gameState) {
    return (
      <main className="control-page">
        <Link to="/" className="new-game-link" state={{ fromGameCode: gameCode }}>
          &larr; New Game
        </Link>
        <h1>Game {gameCode}</h1>
        <p>Connecting&hellip;</p>
      </main>
    )
  }

  const puzzle = puzzlesById.get(gameState.currentPuzzleId)

  return (
    <main className="control-page">
      <header className="control-header">
        <Link to="/" className="new-game-link" state={{ fromGameCode: gameState.gameCode }}>
          &larr; New Game
        </Link>
        <h1>
          Game <span className="game-code">{gameState.gameCode}</span>
        </h1>
      </header>

      <div className="status-row">
        <StatusBadge status={gameState.status} />
        <span className="presence">
          <span data-connected={gameState.displayConnected}>
            <span className="presence-dot" data-connected={gameState.displayConnected} />
            Display {gameState.displayConnected ? 'connected' : 'not connected'}
          </span>
        </span>
        {connectionStatus !== 'connected' && <span role="status">Reconnecting&hellip;</span>}
      </div>

      {actionError && (
        <p className="action-error" role="alert">
          {actionError}
        </p>
      )}

      {['playing', 'correct', 'wrong', 'timeout', 'paused'].includes(gameState.status) && (
        <PuzzlePanel puzzle={puzzle} timeRemaining={timeRemaining} showTimer={gameState.status === 'playing'} />
      )}

      <StatsRow state={gameState} />
      <Actions state={gameState} actions={actions} />

      <h2>Puzzle order</h2>
      <PuzzleOrder puzzleIds={gameState.puzzleIds} currentPuzzleIndex={gameState.currentPuzzleIndex} />
    </main>
  )
}
