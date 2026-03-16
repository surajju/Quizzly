import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../../context/ChatContext'

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const nicknameColors = [
  'text-indigo-300', 'text-emerald-300', 'text-amber-300',
  'text-rose-300', 'text-cyan-300', 'text-violet-300',
  'text-orange-300', 'text-teal-300',
]

function getNicknameColor(nickname) {
  let hash = 0
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
  }
  return nicknameColors[Math.abs(hash) % nicknameColors.length]
}

export default function ChatBox({ collapsed: initialCollapsed = false }) {
  const { messages, sendMessage, unreadCount, setVisible } = useChat()
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setVisible(!collapsed)
  }, [collapsed, setVisible])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
    inputRef.current?.focus()
  }

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm transition-colors"
      >
        💬 Chat
        {collapsed && unreadCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mt-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 overflow-hidden"
          >
            <div className="h-48 overflow-y-auto px-3 py-2 space-y-1">
              {messages.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">No messages yet</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className={`font-medium ${msg.isHost ? 'text-amber-300' : getNicknameColor(msg.nickname)}`}>
                    {msg.nickname}
                    {msg.isHost && ' 👑'}
                  </span>
                  <span className="text-white/40 text-xs ml-1">{formatTime(msg.timestamp)}</span>
                  <p className="text-white/80 break-words">{msg.message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 px-3 py-2 border-t border-white/10">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={200}
                className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 hover:bg-indigo-600 transition-colors"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
