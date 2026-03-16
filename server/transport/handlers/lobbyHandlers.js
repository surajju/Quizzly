import { toRoom, toSocket } from '../emitters/gameEmitter.js';
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
      socket.data.nickname = nickname;

      const result = engine.joinGame(gameCode, socket.id, nickname);

      if (result.currentState) {
        // Reconnection — send full state to reconnecting player
        toSocket(socket, 'reconnected', result.currentState);
      }

      toRoom(io, gameCode, 'participantsUpdated', { participants: result.participants });
      logger.info(`Player ${nickname} joined game ${gameCode}${result.currentState ? ' (reconnected)' : ''}`);
      callback?.({ participants: result.participants, reconnected: !!result.currentState, currentState: result.currentState });
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
          // Mark as disconnected instead of removing
          engine.store.markDisconnected(gameCode, socket.id);
          const participants = engine._getParticipantsList(gameCode);
          toRoom(io, gameCode, 'participantsUpdated', { participants });
        }
        logger.info(`Client disconnected from game ${gameCode}`);
      } catch (err) {
        logger.error('disconnect handler error:', err.message);
      }
    }
  });
}
