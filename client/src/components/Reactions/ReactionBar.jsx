import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReactions } from '../../context/ReactionContext'

export default function ReactionBar() {
  const { sendReaction, EMOJIS } = useReactions()
  const [lastTap, setLastTap] = useState(0)

  const handleTap = (emoji) => {
    const now = Date.now()
    if (now - lastTap < 400) return
    setLastTap(now)
    sendReaction(emoji)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          type="button"
          whileTap={{ scale: 1.4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          onClick={() => handleTap(emoji)}
          className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-lg transition-colors active:bg-white/20"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  )
}
