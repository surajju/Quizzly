import { toRoom } from '../emitters/gameEmitter.js';
import { logger } from '../../utils/logger.js';

export function registerLobbyHandlers(socket, io, engine) {
  socket.on('joinGame', (gameCode, nickname, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      if (!gameCode || !nickname) {
        callback?.({ error: 'gameCode and nickname required' });
        return;
      }
      socket.join(gameCode);
      socket.data.gameCode = gameCode;
      const { participants } = engine.joinGame(gameCode, socket.id, nickname);
      toRoom(io, gameCode, 'participantsUpdated', { participants });
      logger.info(`Player ${nickname} joined game ${gameCode}`);
      callback?.({ participants });
    } catch (err) {
      logger.error('joinGame error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('disconnect', () => {
    const gameCode = socket.data.gameCode;
    if (gameCode) {
      try {
        if (socket.data.role === 'host') {
          const game = engine.store.get(gameCode);
          if (game) game.hostSocketId = null;
        } else {
          const { participants } = engine.leaveGame(gameCode, socket.id);
          toRoom(io, gameCode, 'participantsUpdated', { participants });
        }
        logger.info(`Client disconnected from game ${gameCode}`);
      } catch (err) {
        logger.error('leaveGame on disconnect:', err.message);
      }
    }
  });
}
