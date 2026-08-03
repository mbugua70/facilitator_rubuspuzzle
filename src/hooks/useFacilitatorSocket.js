import { useCallback, useEffect, useState } from 'react'
import { socket } from '../socket/socket.js'

/**
 * Owns the facilitator's Socket.IO lifecycle: connect, join as `facilitator`,
 * rejoin on every reconnect (a reconnected socket is a new connection as far
 * as the backend is concerned), keep the latest `game:state`, and expose the
 * facilitator-only control actions.
 *
 * @param {string} gameCode
 */
export function useFacilitatorSocket(gameCode) {
  const [gameState, setGameState] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('idle')
  const [error, setError] = useState(undefined)
  const [hasSyncedOnce, setHasSyncedOnce] = useState(false)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (!gameCode) return

    function joinGame() {
      setConnectionStatus('joining')
      setError(undefined)

      socket.emit('game:join', { gameCode, role: 'facilitator' }, (ack) => {
        if (!ack.success) {
          setConnectionStatus('error')
          setError(ack.message)
          return
        }

        setGameState(ack.data)
        setConnectionStatus('connected')
        setHasSyncedOnce(true)
      })
    }

    function handleConnect() {
      setConnectionStatus('connecting')
      joinGame()
    }

    function handleDisconnect() {
      setConnectionStatus('disconnected')
    }

    function handleConnectError(socketError) {
      setConnectionStatus('error')
      setError(socketError.message)
    }

    function handleGameState(state) {
      setGameState(state)
      setConnectionStatus('connected')
      setHasSyncedOnce(true)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('game:state', handleGameState)

    if (socket.connected) {
      joinGame()
    } else {
      setConnectionStatus('connecting')
      socket.connect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('game:state', handleGameState)
      socket.disconnect()
    }
  }, [gameCode])

  const emitAction = useCallback(
    (event, extra) => {
      setActionError(null)
      socket.emit(event, { gameCode, ...extra }, (ack) => {
        if (!ack?.success) {
          setActionError(ack?.message ?? 'Action failed')
        }
      })
    },
    [gameCode],
  )

  const actions = {
    start: () => emitAction('game:start'),
    judgeCorrect: () => emitAction('game:judge', { result: 'correct' }),
    judgeWrong: () => emitAction('game:judge', { result: 'wrong' }),
    reveal: () => emitAction('game:reveal'),
    shuffle: () => emitAction('game:shuffle'),
    skip: () => emitAction('game:skip'),
    retry: () => emitAction('game:retry'),
    pause: () => emitAction('game:pause'),
    resume: () => emitAction('game:resume'),
    restart: () => emitAction('game:restart'),
    end: () => emitAction('game:end'),
  }

  return { gameState, connectionStatus, error, hasSyncedOnce, actions, actionError }
}
