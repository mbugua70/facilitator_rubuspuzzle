import { useEffect, useState } from 'react'

const TICK_MS = 200

/**
 * Purely visual countdown derived from the backend's `questionEndsAt`
 * timestamp - the backend's own timer is what actually times a question out,
 * this just gives the facilitator a live number to glance at.
 *
 * @param {{ questionEndsAt: string|null, isPaused?: boolean }} options
 */
export function useCountdown({ questionEndsAt, isPaused }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setNow(Date.now())
    if (!questionEndsAt || isPaused) return

    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(intervalId)
  }, [questionEndsAt, isPaused])

  if (!questionEndsAt) return 0
  return Math.max(0, (new Date(questionEndsAt).getTime() - now) / 1000)
}
