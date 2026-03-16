import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './SocketContext'
import { useGame } from './GameContext'

const EMOJIS = ['🔥', '😂', '😱', '👏', '❤️', '💀', '🎉', '😭']
const MAX_VISIBLE = 30

const ReactionContext = createContext(null)

export function ReactionProvider({ children }) {
  const { socket } = useSocket()
  const { gameCode } = useGame()
  const [floatingReactions, setFloatingReactions] = useState([])
  const counterRef = useRef(0)

  useEffect(() => {
    if (!socket) return
    const onReaction = (reaction) => {
      counterRef.current += 1
      const id = `${reaction.id}-${counterRef.current}`
      const x = 10 + Math.random() * 80
      setFloatingReactions((prev) => {
        const next = [...prev, { ...reaction, id, x, createdAt: Date.now() }]
        return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next
      })
    }
    socket.on('reaction', onReaction)
    return () => socket.off('reaction', onReaction)
  }, [socket])

  useEffect(() => {
    if (floatingReactions.length === 0) return
    const timer = setInterval(() => {
      const now = Date.now()
      setFloatingReactions((prev) => prev.filter((r) => now - r.createdAt < 3000))
    }, 500)
    return () => clearInterval(timer)
  }, [floatingReactions.length > 0])

  const sendReaction = useCallback((emoji) => {
    if (!socket || !gameCode) return
    socket.emit('sendReaction', gameCode, emoji, (res) => {
      if (res?.error && res.error !== 'Too fast') {
        console.error('Reaction error:', res.error)
      }
    })
  }, [socket, gameCode])

  return (
    <ReactionContext.Provider value={{ floatingReactions, sendReaction, EMOJIS }}>
      {children}
    </ReactionContext.Provider>
  )
}

export function useReactions() {
  return useContext(ReactionContext)
}
