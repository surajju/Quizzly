import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import LeaderboardRow from './LeaderboardRow'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import Card from '../common/Card'

export default function Leaderboard({ leaderboard, showPoints = true, highlightSocketId }) {
  const sorted = useLeaderboard(leaderboard)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10 text-sm text-white/60 font-medium">
        <div className="w-10 hidden sm:block" />
        <span className="w-8">#</span>
        <span className="flex-1">Player</span>
        <span>Score</span>
        {showPoints && <span className="w-12 hidden sm:inline">Pts</span>}
      </div>
      <LayoutGroup>
        <div className="space-y-2 mt-2">
          <AnimatePresence mode="popLayout">
            {sorted.map((entry, index) => (
              <LeaderboardRow
                key={entry.socketId || entry.nickname || index}
                entry={entry}
                index={index}
                showPoints={showPoints}
                highlighted={highlightSocketId && entry.socketId === highlightSocketId}
              />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </Card>
  )
}
