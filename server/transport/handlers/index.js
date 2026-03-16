import { registerLobbyHandlers } from './lobbyHandlers.js';
import { registerHostHandlers } from './hostHandlers.js';
import { registerPlayerHandlers } from './playerHandlers.js';
import { registerChatHandlers } from './chatHandlers.js';

export function registerHandlers(socket, io, engine, gameStore) {
  registerLobbyHandlers(socket, io, engine);
  registerHostHandlers(socket, io, engine, gameStore);
  registerPlayerHandlers(socket, io, engine, gameStore);
  registerChatHandlers(socket, io);
}
