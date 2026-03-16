export function authMiddleware() {
  return (socket, next) => {
    const gameCode = socket.handshake.query?.gameCode || socket.handshake.auth?.gameCode;
    const role = socket.handshake.query?.role || socket.handshake.auth?.role || 'player';
    socket.data.gameCode = gameCode;
    socket.data.role = role;
    next();
  };
}
