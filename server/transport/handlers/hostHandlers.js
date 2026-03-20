import { toRoom, toHost, toSocket } from '../emitters/gameEmitter.js';
import { logger } from '../../utils/logger.js';

export function registerHostHandlers(socket, io, engine, gameStore) {
  socket.on('joinAsHost', (gameCode, hostToken, callback) => {
    try {
      const game = gameStore.get(gameCode);
      if (!game) {
        callback?.({ error: 'Game not found' });
        return;
      }
      if (game.hostToken !== hostToken) {
        callback?.({ error: 'Invalid host token' });
        return;
      }
      socket.join(gameCode);
      socket.data.gameCode = gameCode;
      socket.data.role = 'host';
      engine.setHostSocket(gameCode, socket.id);
      const participants = Array.from(game.participants.values()).map((p) => ({
        socketId: p.socketId,
        nickname: p.nickname,
        score: p.score,
        streak: p.streak ?? 0,
      }));
      toSocket(socket, 'hostJoined', { gameCode, participants });
      logger.info(`Host joined game ${gameCode}`);
      callback?.({ gameCode, participants });
    } catch (err) {
      logger.error('joinAsHost error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('createGame', (quiz, callback) => {
    try {
      const { gameCode, hostToken } = engine.createGame(quiz);
      socket.join(gameCode);
      socket.data.gameCode = gameCode;
      socket.data.role = 'host';
      engine.setHostSocket(gameCode, socket.id);
      toSocket(socket, 'gameCreated', { gameCode, hostToken });
      logger.info(`Game created: ${gameCode}`);
      callback?.({ gameCode, hostToken });
    } catch (err) {
      logger.error('createGame error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('startQuiz', (gameCode, hostToken, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      const result = engine.startQuiz(gameCode, hostToken);
      toRoom(io, gameCode, 'questionStart', result);
      logger.info(`Quiz started for game ${gameCode}`);
      callback?.(result);
    } catch (err) {
      logger.error('startQuiz error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('revealAnswer', (gameCode, hostToken, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      const result = engine.revealAnswer(gameCode, hostToken);
      toRoom(io, gameCode, 'reveal', {
        correctIndex: result.correctIndex,
        leaderboard: result.leaderboard,
        questionIndex: result.questionIndex,
        isPoll: result.isPoll || false,
        pollResults: result.pollResults || null,
      });
      logger.info(`Answer revealed for game ${gameCode}`);
      callback?.(result);
    } catch (err) {
      logger.error('revealAnswer error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('nextQuestion', (gameCode, hostToken, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      const result = engine.nextQuestion(gameCode, hostToken);
      if (result.state === 'ended') {
        toRoom(io, gameCode, 'quizEnd', { finalLeaderboard: result.finalLeaderboard });
      } else {
        toRoom(io, gameCode, 'questionStart', result);
      }
      logger.info(`Next question for game ${gameCode}`);
      callback?.(result);
    } catch (err) {
      logger.error('nextQuestion error:', err.message);
      callback?.({ error: err.message });
    }
  });

  socket.on('endQuiz', (gameCode, hostToken, callback) => {
    try {
      gameCode = gameCode || socket.data.gameCode;
      const result = engine.endQuiz(gameCode, hostToken);
      toRoom(io, gameCode, 'quizEnd', { finalLeaderboard: result.finalLeaderboard });
      logger.info(`Quiz ended for game ${gameCode}`);
      callback?.(result);
    } catch (err) {
      logger.error('endQuiz error:', err.message);
      callback?.({ error: err.message });
    }
  });
}
