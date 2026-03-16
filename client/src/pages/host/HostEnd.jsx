import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'
import Button from '../../components/common/Button'
import Podium from '../../components/Leaderboard/Podium'
import Leaderboard from '../../components/Leaderboard/Leaderboard'
import PageWrapper from '../../components/layout/PageWrapper'
import GameHeader from '../../components/layout/GameHeader'

export default function HostEnd() {
  const navigate = useNavigate()
  const { finalLeaderboard, dispatch: gameDispatch } = useGame()
  const { reset: resetPlayer } = usePlayer()

  const handleBackToHome = () => {
    gameDispatch({ type: 'RESET' })
    resetPlayer()
    navigate('/')
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <GameHeader />
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
          <p className="text-white/60">Thanks for playing!</p>
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
          <Leaderboard leaderboard={finalLeaderboard} />
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
