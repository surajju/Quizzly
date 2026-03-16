import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'

const MAX_MESSAGES = 50

export function useChat() {
  const { socket } = useSocket()
  const { gameCode } = useGame()
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const visibleRef = useRef(false)

  const setVisible = useCallback((visible) => {
    visibleRef.current = visible
    if (visible) setUnreadCount(0)
  }, [])

  useEffect(() => {
    if (!socket) return

    const onChatMessage = (msg) => {
      setMessages((prev) => {
        const next = [...prev, msg]
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next
      })
      if (!visibleRef.current) {
        setUnreadCount((prev) => prev + 1)
      }
    }

    socket.on('chatMessage', onChatMessage)
    return () => socket.off('chatMessage', onChatMessage)
  }, [socket])

  const sendMessage = useCallback((text) => {
    if (!socket || !gameCode || !text.trim()) return
    socket.emit('sendMessage', gameCode, text.trim(), (res) => {
      if (res?.error) console.error('Chat error:', res.error)
    })
  }, [socket, gameCode])

  const clearMessages = useCallback(() => {
    setMessages([])
    setUnreadCount(0)
  }, [])

  return { messages, sendMessage, unreadCount, setVisible, clearMessages }
}
