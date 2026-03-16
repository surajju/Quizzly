import { motion } from 'framer-motion'
import { useLeaderboard } from '../../hooks/useLeaderboard'

const heights = { 1: 120, 2: 90, 3: 60 }
const colors = {
  1: 'from-amber-400 to-amber-600',
  2: 'from-slate-300 to-slate-500',
  3: 'from-amber-700 to-amber-900',
}

export default function Podium({ leaderboard }) {
  const sorted = useLeaderboard(leaderboard)
  const top3 = sorted.slice(0, 3)
  const order = [2, 1, 3]

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 h-48 sm:h-64">
      {order.map((pos) => {
        const entry = top3[pos - 1]
        const h = heights[pos]
        return (
          <motion.div
            key={pos}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: h, opacity: 1 }}
            transition={{ duration: 0.5, delay: pos * 0.1 }}
            className="flex flex-col items-center w-20 sm:w-24"
          >
            {entry && (
              <div className="mb-2 text-center">
                <p className="font-bold text-white truncate">{entry.nickname}</p>
                <p className="text-sm text-white/60">{entry.score} pts</p>
              </div>
            )}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + pos * 0.1 }}
              origin="bottom"
              className={`
                w-full rounded-t-lg bg-gradient-to-b ${colors[pos]}
                flex items-center justify-center
                text-white font-bold text-2xl
              `}
              style={{ height: h }}
            >
              #{pos}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
