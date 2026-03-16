import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { gameStore } from '../store/index.js';
import { GameEngine } from '../engine/GameEngine.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import { registerHandlers } from './handlers/index.js';

let engine;

export function initSocketServer(httpServer) {
  const socketOpts = config.IS_PRODUCTION
    ? {}
    : { cors: { origin: config.CORS_ORIGINS } };

  const io = new Server(httpServer, socketOpts);

  engine = new GameEngine(gameStore, config);

  io.use(authMiddleware());
  io.use(rateLimiterMiddleware());

  io.on('connection', (socket) => {
    registerHandlers(socket, io, engine, gameStore);
  });

  return io;
}
