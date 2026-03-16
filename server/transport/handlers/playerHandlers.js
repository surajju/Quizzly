import { toHost, toSocket } from '../emitters/gameEmitter.js';
import { logger } from '../../utils/logger.js';

export function registerPlayerHandlers(socket, io, engine, gameStore) {
  socket.on('submitAnswer', (gameCode, optionIndex, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      const { emitToHost, emitToPlayer } = engine.submitAnswer(gameCode, socket.id, optionIndex);
      const game = gameStore.get(gameCode);
      toHost(io, game, 'answerUpdate', emitToHost);
      toSocket(socket, 'answerAck', emitToPlayer);
      callback?.(emitToPlayer);
    } catch (err) {
      logger.error('submitAnswer error:', err.message);
      callback?.({ error: err.message });
    }
  });
}
