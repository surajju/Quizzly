import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { GameProvider, useGame } from './context/GameContext'
import { PlayerProvider } from './context/PlayerContext'
import { useGameEvents } from './hooks/useGame'

import Home from './pages/Home'
import CreateQuiz from './pages/CreateQuiz'
import HostLobby from './pages/host/HostLobby'
import HostQuestion from './pages/host/HostQuestion'
import HostReveal from './pages/host/HostReveal'
import HostEnd from './pages/host/HostEnd'
import PlayerJoin from './pages/player/PlayerJoin'
import PlayerLobby from './pages/player/PlayerLobby'
import PlayerQuestion from './pages/player/PlayerQuestion'
import PlayerReveal from './pages/player/PlayerReveal'
import PlayerEnd from './pages/player/PlayerEnd'

function GameEventListener() {
  useGameEvents()
  return null
}

function NavigationManager() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state: phase, hostToken } = useGame()

  useEffect(() => {
    const path = location.pathname
    const isHost = !!hostToken

    if (!phase) return

    if (phase === 'question') {
      if (isHost && path !== '/host/question') {
        navigate('/host/question', { replace: true })
      } else if (!isHost && path !== '/play/question') {
        navigate('/play/question', { replace: true })
      }
    } else if (phase === 'reveal') {
      if (isHost && path !== '/host/reveal') {
        navigate('/host/reveal', { replace: true })
      } else if (!isHost && path !== '/play/reveal') {
        navigate('/play/reveal', { replace: true })
      }
    } else if (phase === 'ended') {
      if (isHost && path !== '/host/end') {
        navigate('/host/end', { replace: true })
      } else if (!isHost && path !== '/play/end') {
        navigate('/play/end', { replace: true })
      }
    }
  }, [phase, hostToken, navigate, location.pathname])

  return null
}

function AppRoutes() {
  return (
    <>
      <GameEventListener />
      <NavigationManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/host/lobby" element={<HostLobby />} />
        <Route path="/host/question" element={<HostQuestion />} />
        <Route path="/host/reveal" element={<HostReveal />} />
        <Route path="/host/end" element={<HostEnd />} />
        <Route path="/play/join" element={<PlayerJoin />} />
        <Route path="/play/lobby" element={<PlayerLobby />} />
        <Route path="/play/question" element={<PlayerQuestion />} />
        <Route path="/play/reveal" element={<PlayerReveal />} />
        <Route path="/play/end" element={<PlayerEnd />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </GameProvider>
    </SocketProvider>
  )
}
