import { motion } from 'framer-motion'
import { useGameEvents } from '../../hooks/useGame'
import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'
import Card from '../../components/common/Card'
import PageWrapper from '../../components/layout/PageWrapper'

export default function PlayerLobby() {
  const { gameCode, participants } = useGame()
  const { nickname } = usePlayer()

  useGameEvents()

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl text-white/80 mb-2"
          >
            Waiting for host to start...
          </motion.p>
          <p className="text-white/50 text-sm">Get ready! The quiz will begin soon.</p>
        </motion.div>

        <Card className="text-center py-6 mb-6">
          <p className="text-white/60 text-sm mb-2">Game Code</p>
          <p className="text-2xl font-mono font-bold text-white tracking-widest">{gameCode}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Players in lobby</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {participants?.length ? (
              participants.map((p, i) => (
                <motion.div
                  key={p.socketId || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                    p.nickname === nickname ? 'bg-indigo-500/30 ring-2 ring-indigo-400' : 'bg-white/5'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-white">
                    {p.nickname || 'Anonymous'}
                    {p.nickname === nickname && (
                      <span className="ml-2 text-indigo-300 text-sm">(you)</span>
                    )}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-white/50 text-center py-8">No players yet</p>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
