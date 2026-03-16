import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'
import { usePlayer } from '../context/PlayerContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import PageWrapper from '../components/layout/PageWrapper'

export default function Home() {
  const navigate = useNavigate()
  const { socket, connected } = useSocket()
  const { dispatch } = useGame()
  const { setNickname } = usePlayer()
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [gameCode, setGameCode] = useState('')
  const [nickname, setNicknameInput] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoinGame = (e) => {
    e.preventDefault()
    setJoinError('')
    if (!gameCode.trim() || !nickname.trim()) {
      setJoinError('Please enter both game code and nickname')
      return
    }
    setJoining(true)
    socket.emit('joinGame', gameCode.trim().toUpperCase(), nickname.trim(), (res) => {
      setJoining(false)
      if (res?.error) {
        setJoinError(res.error || 'Failed to join game')
        return
      }
      dispatch({ type: 'SET_GAME', payload: { gameCode: gameCode.trim().toUpperCase(), hostToken: null } })
      setNickname(nickname.trim())
      navigate('/play/lobby')
    })
  }

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <span className="text-6xl">🔥</span>
            QuizFire
          </h1>
          <p className="text-xl text-white/70">Create and play real-time quizzes</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <Card
              glow
              className="cursor-pointer h-full hover:border-indigo-500/50 transition-colors"
              onClick={() => navigate('/create')}
            >
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎯</span>
                <h2 className="text-xl font-bold text-white mb-2">Create Quiz</h2>
                <p className="text-white/60 text-sm">Host your own quiz and invite friends</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <Card
              glow
              className={`h-full transition-colors ${showJoinForm ? 'border-indigo-500/50' : 'cursor-pointer hover:border-indigo-500/50'}`}
              onClick={() => !showJoinForm && setShowJoinForm(true)}
            >
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎮</span>
                <h2 className="text-xl font-bold text-white mb-2">Join Quiz</h2>
                <p className="text-white/60 text-sm">Enter a code to join</p>

                {showJoinForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 space-y-4 text-left"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={handleJoinGame}
                  >
                    <Input
                      label="Game Code"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                    />
                    <Input
                      label="Nickname"
                      value={nickname}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="Your nickname"
                    />
                    {joinError && <p className="text-sm text-red-400">{joinError}</p>}
                    <Button type="submit" variant="secondary" size="lg" className="w-full" loading={joining} disabled={!connected}>
                      Join
                    </Button>
                  </motion.form>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {!connected && (
          <p className="mt-6 text-amber-400/80 text-sm">Connecting to server...</p>
        )}
      </div>
    </PageWrapper>
  )
}
