import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSocket } from '../../context/SocketContext'
import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'
import PageWrapper from '../../components/layout/PageWrapper'

export default function PlayerJoin() {
  const navigate = useNavigate()
  const { gameCode: urlCode } = useParams()
  const { socket, connected } = useSocket()
  const { dispatch } = useGame()
  const { setNickname } = usePlayer()
  const [gameCode, setGameCode] = useState(urlCode?.toUpperCase() || '')
  const nicknameInputRef = useRef(null)

  useEffect(() => {
    if (urlCode) {
      setGameCode(urlCode.toUpperCase())
      nicknameInputRef.current?.focus()
    }
  }, [urlCode])
  const [nickname, setNicknameInput] = useState('')
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoin = (e) => {
    e.preventDefault()
    setError('')
    if (!gameCode.trim() || !nickname.trim()) {
      setError('Please enter both game code and nickname')
      return
    }
    setJoining(true)
    socket.emit('joinGame', gameCode.trim().toUpperCase(), nickname.trim(), (res) => {
      setJoining(false)
      if (res?.error) {
        setError(res.error || 'Failed to join game')
        return
      }
      dispatch({ type: 'SET_GAME', payload: { gameCode: gameCode.trim().toUpperCase(), hostToken: null } })
      setNickname(nickname.trim())
      navigate('/play/lobby')
    })
  }

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-2">Join Quiz</h1>
          <p className="text-white/60">Enter the game code and your nickname</p>
        </motion.div>

        <Card>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              label="Game Code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
            />
            <Input
              ref={nicknameInputRef}
              label="Nickname"
              value={nickname}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Your nickname"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={joining}
              disabled={!connected}
            >
              Join
            </Button>
          </form>
        </Card>
      </div>
    </PageWrapper>
  )
}
