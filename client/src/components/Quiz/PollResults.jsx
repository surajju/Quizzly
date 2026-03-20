import { motion } from 'framer-motion'

const barColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
]

export default function PollResults({ results }) {
  if (!results?.length) return null

  const maxVotes = Math.max(...results.map((r) => r.votes), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📊</span>
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Poll Results</h3>
      </div>
      {results.map((result, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-1"
        >
          <div className="flex justify-between items-baseline">
            <span className="text-white text-sm font-medium truncate mr-2">{result.option}</span>
            <span className="text-white/60 text-xs whitespace-nowrap">
              {result.votes} vote{result.votes !== 1 ? 's' : ''} · {result.percentage}%
            </span>
          </div>
          <div className="h-8 rounded-lg bg-white/10 overflow-hidden relative">
            <motion.div
              className={`h-full rounded-lg ${barColors[i % barColors.length]}`}
              initial={{ width: 0 }}
              animate={{ width: `${(result.votes / maxVotes) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
            />
            <span className="absolute inset-0 flex items-center pl-3 text-xs font-bold text-white drop-shadow">
              {String.fromCharCode(65 + i)}
            </span>
          </div>
        </motion.div>
      ))}
      <p className="text-white/40 text-xs text-center mt-2">
        {results.reduce((a, r) => a + r.votes, 0)} total votes
      </p>
    </div>
  )
}
