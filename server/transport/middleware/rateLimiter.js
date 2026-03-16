const LIMIT = 30;
const WINDOW_MS = 1000;

export function rateLimiterMiddleware() {
  const counts = new Map();

  return (socket, next) => {
    const check = () => {
      const key = socket.id;
      const now = Date.now();
      let bucket = counts.get(key);

      if (!bucket) {
        bucket = { count: 0, resetAt: now + WINDOW_MS };
        counts.set(key, bucket);
      }

      if (now >= bucket.resetAt) {
        bucket.count = 0;
        bucket.resetAt = now + WINDOW_MS;
      }

      bucket.count++;
      if (bucket.count > LIMIT) {
        counts.delete(key);
        socket.emit('rateLimitExceeded', { message: 'Too many requests' });
        socket.disconnect(true);
      }
    };

    socket.onAny(check);
    socket.on('disconnect', () => counts.delete(socket.id));
    next();
  };
}
