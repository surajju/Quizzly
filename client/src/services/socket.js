import { io } from 'socket.io-client'
import { config } from '../config'

let socket = null

export function createSocket() {
  if (socket?.connected) return socket
  socket = io(config.SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
