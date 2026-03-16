export function toRoom(io, gameCode, event, data) {
  io.to(gameCode).emit(event, data);
}

export function toSocket(socket, event, data) {
  socket.emit(event, data);
}

export function toHost(io, game, event, data) {
  if (game?.hostSocketId) {
    io.to(game.hostSocketId).emit(event, data);
  }
}

export function toPlayersOnly(io, gameCode, hostSocketId, event, data) {
  if (hostSocketId) {
    io.to(gameCode).except(hostSocketId).emit(event, data);
  } else {
    io.to(gameCode).emit(event, data);
  }
}
