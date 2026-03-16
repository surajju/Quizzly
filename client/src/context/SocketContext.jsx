import { createContext, useContext, useEffect, useState } from 'react'
import { createSocket, disconnectSocket, getSocket } from '../services/socket'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = createSocket()
    setConnected(socket.connected)

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      disconnectSocket()
    }
  }, [])

  const socket = getSocket()

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
