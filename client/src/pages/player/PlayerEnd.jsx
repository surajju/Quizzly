import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'
import { useSocket } from '../../context/SocketContext'
import Button from '../../components/common/Button'
import Podium from '../../components/Leaderboard/Podium'
import Leaderboard from '../../components/Leaderboard/Leaderboard'
import PageWrapper from '../../components/layout/PageWrapper'

export default function PlayerEnd() {
  const navigate = useNavigate()
  const { finalLeaderboard, dispatch: gameDispatch } = useGame()
  const { state: playerState, updateFromLeaderboard, reset: resetPlayer } = usePlayer()
  const { socket } = useSocket()

  useEffect(() => {
    if (finalLeaderboard && socket?.id) {
      updateFromLeaderboard(finalLeaderboard, socket.id)
    }
  }, [finalLeaderboard, socket?.id, updateFromLeaderboard])

  const handleBackToHome = () => {
    gameDispatch({ type: 'RESET' })
    resetPlayer()
    navigate('/')
  }

  const myEntry = finalLeaderboard?.find((e) => e.socketId === socket?.id)

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🎉</span>
            Quiz Complete!
          </h1>
          <p className="text-white/60 mb-6">Great job!</p>

          <div className="inline-flex flex-col gap-2 p-6 rounded-xl bg-white/5 border border-white/10 text-left">
            <p className="text-white/60">Your final score</p>
            <p className="text-3xl font-bold text-indigo-300">{myEntry?.score ?? playerState.score ?? 0} pts</p>
            <p className="text-white/80">Rank: #{myEntry?.rank ?? playerState.rank ?? '—'}</p>
            {myEntry?.streak >= 2 && (
              <p className="text-amber-400">Best streak: 🔥 {myEntry.streak}</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Podium leaderboard={finalLeaderboard} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Leaderboard leaderboard={finalLeaderboard} highlightSocketId={socket?.id} />
        </motion.div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleBackToHome}
        >
          Back to Home
        </Button>
      </div>
    </PageWrapper>
  )
}
