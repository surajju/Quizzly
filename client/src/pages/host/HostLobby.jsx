import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameEvents } from '../../hooks/useGame'
import { useGame } from '../../context/GameContext'
import { useSocket } from '../../context/SocketContext'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import PageWrapper from '../../components/layout/PageWrapper'
import GameHeader from '../../components/layout/GameHeader'

export default function HostLobby() {
  const { gameCode, hostToken, participants, dispatch } = useGame()
  const { socket } = useSocket()
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useGameEvents()

  const handleStartQuiz = () => {
    socket.emit('startQuiz', gameCode, hostToken, (res) => {
      if (res?.error) console.error(res.error)
    })
  }

  const handleCopyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyLink = () => {
    if (gameCode) {
      navigator.clipboard.writeText(`${window.location.origin}/join/${gameCode}`)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">
        <GameHeader />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-2">Game Lobby</h1>
          <p className="text-white/60">Share this code with players!</p>
        </motion.div>

        <Card glow className="text-center py-8 mb-6">
          <p className="text-white/60 text-sm mb-2">Game Code</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <motion.span
              key={gameCode}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl md:text-5xl font-mono font-bold text-white tracking-[0.3em]"
            >
              {gameCode}
            </motion.span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
              >
                {linkCopied ? '✓ Link copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Participants</h2>
            <Badge variant="info">{participants?.length || 0} players</Badge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {participants?.length ? (
              participants.map((p, i) => (
                <motion.div
                  key={p.socketId || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5"
                >
                  <span className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-white">{p.nickname || 'Anonymous'}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-white/50 text-center py-8">Waiting for players to join...</p>
            )}
          </div>
        </Card>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartQuiz}
          disabled={!participants?.length}
        >
          Start Quiz
        </Button>
      </div>
    </PageWrapper>
  )
}
