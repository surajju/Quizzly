import { toRoom } from '../emitters/gameEmitter.js';
import { logger } from '../../utils/logger.js';

export function registerChatHandlers(socket, io) {
  socket.on('sendMessage', (gameCode, message, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      if (!gameCode) {
        callback?.({ error: 'Not in a game' });
        return;
      }

      const trimmed = (message || '').trim().slice(0, 200);
      if (!trimmed) {
        callback?.({ error: 'Message cannot be empty' });
        return;
      }

      const nickname = socket.data.nickname || socket.data.role || 'Anonymous';
      const chatMessage = {
        id: Date.now() + '-' + socket.id.slice(-4),
        nickname,
        message: trimmed,
        timestamp: Date.now(),
        isHost: socket.data.role === 'host',
      };

      toRoom(io, gameCode, 'chatMessage', chatMessage);
      callback?.({ ok: true });
    } catch (err) {
      logger.error('sendMessage error:', err.message);
      callback?.({ error: err.message });
    }
  });
}
