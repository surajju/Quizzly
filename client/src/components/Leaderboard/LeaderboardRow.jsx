import { motion } from 'framer-motion'
import Badge from '../common/Badge'

const rankColors = {
  1: 'border-amber-400/50 bg-amber-500/10',
  2: 'border-slate-300/50 bg-slate-400/10',
  3: 'border-amber-700/50 bg-amber-800/20',
}

export default function LeaderboardRow({
  entry,
  index,
  showPoints = true,
  highlighted = false,
}) {
  const { rank, nickname, score, pointsEarned, prevRank, streak, wasCorrect } = entry
  const rankColor = rankColors[rank] || ''
  const rankChange =
    prevRank != null && rank !== prevRank
      ? rank < prevRank
        ? 'up'
        : 'down'
      : 'same'

  return (
    <motion.div
      layout
      layoutId={`leaderboard-${entry.socketId || index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-lg
        border border-white/10 bg-white/5
        ${rankColor}
        ${highlighted ? 'ring-2 ring-indigo-400 bg-indigo-500/20' : ''}
      `}
    >
      <div className="w-10 flex items-center justify-center hidden sm:flex">
        {rankChange === 'up' && (
          <span className="text-emerald-400 text-lg">↑</span>
        )}
        {rankChange === 'down' && (
          <span className="text-red-400 text-lg">↓</span>
        )}
        {rankChange === 'same' && (
          <span className="text-white/40 text-lg">—</span>
        )}
      </div>
      <span className="w-8 font-bold text-white/80">#{rank}</span>
      <span className="flex-1 font-medium text-white truncate">{nickname}</span>
      <span className="font-bold text-indigo-300">{score}</span>
      {showPoints && pointsEarned != null && pointsEarned > 0 && (
        <span className="text-emerald-400 text-sm hidden sm:inline">+{pointsEarned}</span>
      )}
      {showPoints && wasCorrect === false && (
        <span className="text-red-400 text-sm">✗</span>
      )}
      {showPoints && wasCorrect === true && (
        <span className="text-emerald-400 text-sm">✓</span>
      )}
      {streak >= 2 && (
        <Badge variant="warning">🔥 {streak}</Badge>
      )}
    </motion.div>
  )
}
