import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameEvents } from '../../hooks/useGame'
import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'
import { useSocket } from '../../context/SocketContext'
import Leaderboard from '../../components/Leaderboard/Leaderboard'
import PageWrapper from '../../components/layout/PageWrapper'
import GameHeader from '../../components/layout/GameHeader'

export default function PlayerReveal() {
  const { leaderboard } = useGame()
  const { socket } = useSocket()
  const { wasCorrect, pointsEarned, streak, rank, prevRank, updateFromLeaderboard } = usePlayer()

  useGameEvents()

  useEffect(() => {
    if (leaderboard && socket?.id) {
      updateFromLeaderboard(leaderboard, socket.id)
    }
  }, [leaderboard, socket?.id, updateFromLeaderboard])

  const rankChange = prevRank != null && rank !== prevRank
    ? rank < prevRank
      ? 'up'
      : 'down'
    : 'same'

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <GameHeader />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          {wasCorrect ? (
            <div className="flex flex-col items-center gap-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-8xl"
              >
                ✓
              </motion.span>
              <h2 className="text-3xl font-bold text-emerald-400">Correct!</h2>
              {pointsEarned > 0 && (
                <p className="text-xl text-white/80">+{pointsEarned} points</p>
              )}
              {streak >= 2 && (
                <p className="text-amber-400 font-medium">🔥 {streak} streak!</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-8xl text-red-400"
              >
                ✗
              </motion.span>
              <h2 className="text-3xl font-bold text-red-400">Wrong</h2>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-white/80">Your rank:</span>
            <span className="font-bold text-white">#{rank}</span>
            {rankChange === 'up' && <span className="text-emerald-400">↑</span>}
            {rankChange === 'down' && <span className="text-red-400">↓</span>}
          </div>
        </motion.div>

        <div className="mb-6">
          <Leaderboard leaderboard={leaderboard} highlightSocketId={socket?.id} />
        </div>

        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center text-white/60"
        >
          Waiting for next question...
        </motion.p>
      </div>
    </PageWrapper>
  )
}
