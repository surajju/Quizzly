import { logger } from '../../utils/logger.js';

const ALLOWED_EMOJIS = ['🔥', '😂', '😱', '👏', '❤️', '💀', '🎉', '😭'];
const COOLDOWN_MS = 500;
const lastReaction = new Map();

export function registerReactionHandlers(socket, io) {
  socket.on('sendReaction', (gameCode, emoji, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      if (!gameCode) {
        callback?.({ error: 'Not in a game' });
        return;
      }

      if (!ALLOWED_EMOJIS.includes(emoji)) {
        callback?.({ error: 'Invalid emoji' });
        return;
      }

      const now = Date.now();
      const lastTime = lastReaction.get(socket.id) || 0;
      if (now - lastTime < COOLDOWN_MS) {
        callback?.({ error: 'Too fast' });
        return;
      }
      lastReaction.set(socket.id, now);

      const reaction = {
        id: now + '-' + socket.id.slice(-4),
        emoji,
        nickname: socket.data.nickname || socket.data.role || 'Anonymous',
      };

      io.to(gameCode).emit('reaction', reaction);
      callback?.({ ok: true });
    } catch (err) {
      logger.error('sendReaction error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('disconnect', () => {
    lastReaction.delete(socket.id);
  });
}
