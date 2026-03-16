import { useState, useEffect, useRef } from 'react'

export function useTimer(endsAt) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const rafRef = useRef(null)
  const initialTimeRef = useRef(0)
  const lastTimeRef = useRef(null)

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft(0)
      setIsExpired(false)
      initialTimeRef.current = 0
      return
    }

    const total = Math.max(0, (endsAt - Date.now()) / 1000)
    initialTimeRef.current = total
    setTimeLeft(total)
    setIsExpired(total <= 0)
    lastTimeRef.current = null

    if (total <= 0) return

    let expired = false
    const tick = (now) => {
      if (expired) return
      if (!lastTimeRef.current) lastTimeRef.current = now
      const elapsed = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      setTimeLeft((prev) => {
        const next = Math.max(0, prev - elapsed)
        if (next <= 0) {
          expired = true
          setIsExpired(true)
        }
        return next
      })
      if (!expired) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [endsAt])

  const progress =
    initialTimeRef.current > 0
      ? Math.min(1, Math.max(0, 1 - timeLeft / initialTimeRef.current))
      : 1

  return {
    timeLeft: Math.ceil(timeLeft),
    progress,
    isExpired,
  }
}
