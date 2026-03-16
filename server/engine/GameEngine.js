import { v4 as uuidv4 } from 'uuid';
import { gameStore } from '../store/GameStore.js';
import { generateCode } from '../utils/generateCode.js';
import {
  GameNotFound,
  InvalidAction,
  AlreadyAnswered,
  InvalidState,
} from '../errors/GameError.js';
import { STATES, transition } from './stateMachine.js';
import { calcScore } from './scoring.js';
import { computeLeaderboard } from './leaderboard.js';
import { TimerManager } from './timer.js';

export class GameEngine {
  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.timerManager = new TimerManager();
  }

  createGame(quiz) {
    let gameCode;
    do {
      gameCode = generateCode(this.config.GAME_CODE_LENGTH);
    } while (this.store.get(gameCode));

    const hostToken = uuidv4();
    this.store.create(gameCode, {
      state: STATES.LOBBY,
      hostToken,
      hostSocketId: null,
      quiz,
      questionIndex: 0,
      timerExpired: false,
    });
    return { gameCode, hostToken };
  }

  joinGame(gameCode, socketId, nickname) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    if (game.state !== STATES.LOBBY) throw new InvalidState('Game already started');
    this.store.addPlayer(gameCode, socketId, nickname);
    const participants = this._getParticipantsList(gameCode);
    return { participants };
  }

  leaveGame(gameCode, socketId) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    this.store.removePlayer(gameCode, socketId);
    const participants = this._getParticipantsList(gameCode);
    return { participants };
  }

  startQuiz(gameCode, hostToken) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    if (game.hostToken !== hostToken) throw new InvalidAction('Invalid host token');
    transition(game, STATES.QUESTION);
    game.questionIndex = 0;
    game.timerExpired = false;
    return this._emitQuestion(gameCode);
  }

  submitAnswer(gameCode, socketId, optionIndex) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    if (game.state !== STATES.QUESTION) throw new InvalidState('Not in question phase');
    if (game.answers.has(socketId)) throw new AlreadyAnswered();

    const participant = game.participants.get(socketId);
    if (!participant) throw new InvalidAction('Not a participant');

    const timeLeft = this.timerManager.getRemainingTime(gameCode);
    const timeLimit = (game.quiz?.questions?.[game.questionIndex]?.timeLimit ?? this.config.TIMER_DEFAULT) * 1000;

    this.store.setAnswer(gameCode, socketId, {
      optionIndex,
      timeLeft,
      submittedAt: Date.now(),
    });

    const emitToHost = {
      socketId,
      nickname: participant.nickname,
      optionIndex,
      answeredAt: Date.now(),
    };

    const emitToPlayer = {
      optionIndex,
      timeLeft,
    };

    return { emitToHost, emitToPlayer };
  }

  revealAnswer(gameCode, hostToken) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    if (game.hostToken !== hostToken) throw new InvalidAction('Invalid host token');
    transition(game, STATES.REVEAL);
    this.timerManager.stopTimer(gameCode);

    const question = game.quiz?.questions?.[game.questionIndex];
    const correctIndex = question?.correctIndex ?? -1;
    const timeLimit = (question?.timeLimit ?? this.config.TIMER_DEFAULT) * 1000;

    for (const [socketId, answer] of game.answers) {
      const participant = game.participants.get(socketId);
      if (!participant) continue;

      const correct = answer.optionIndex === correctIndex;
      const timeLeft = answer.timeLeft ?? 0;
      const streak = participant.streak ?? 0;

      const points = calcScore('streakBased', {
        correct,
        timeLeft,
        timeLimit,
        streak: correct ? streak + 1 : streak,
      });

      this.store.updateScore(gameCode, socketId, points);
      this.store.updateStreak(gameCode, socketId, correct);

      participant.wasCorrect = correct;
      participant.pointsEarned = points;
    }

    const leaderboard = computeLeaderboard(game.participants);
    return { correctIndex, leaderboard, questionIndex: game.questionIndex };
  }

  nextQuestion(gameCode, hostToken) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    if (game.hostToken !== hostToken) throw new InvalidAction('Invalid host token');
    if (game.state !== STATES.REVEAL) throw new InvalidState('Must reveal first');

    this.store.clearAnswers(gameCode);
    for (const p of game.participants.values()) {
      p.wasCorrect = false;
      p.pointsEarned = 0;
    }

    const questions = game.quiz?.questions ?? [];
    const nextIndex = game.questionIndex + 1;

    if (nextIndex >= questions.length) {
      transition(game, STATES.ENDED);
      const leaderboard = computeLeaderboard(game.participants);
      return { finalLeaderboard: leaderboard, state: 'ended' };
    }

    game.questionIndex = nextIndex;
    game.timerExpired = false;
    transition(game, STATES.QUESTION);
    return this._emitQuestion(gameCode);
  }

  endQuiz(gameCode, hostToken) {
    const game = this.store.get(gameCode);
    if (!game) throw new GameNotFound();
    if (game.hostToken !== hostToken) throw new InvalidAction('Invalid host token');

    this.timerManager.cleanup(gameCode);
    game.state = STATES.ENDED;
    const leaderboard = computeLeaderboard(game.participants);
    return { finalLeaderboard: leaderboard, state: 'ended' };
  }

  getGameState(gameCode) {
    const game = this.store.get(gameCode);
    if (!game) return null;

    const publicState = {
      gameCode,
      state: game.state,
      questionIndex: game.questionIndex,
      totalQuestions: (game.quiz?.questions ?? []).length,
      participants: this._getParticipantsList(gameCode),
    };

    if (game.state === STATES.QUESTION) {
      const question = game.quiz?.questions?.[game.questionIndex];
      if (question) {
        publicState.question = this._sanitizeQuestion(question);
        publicState.endsAt = Date.now() + this.timerManager.getRemainingTime(gameCode);
      }
    }

    return publicState;
  }

  setHostSocket(gameCode, socketId) {
    const game = this.store.get(gameCode);
    if (game) game.hostSocketId = socketId;
  }

  getTimerExpired(gameCode) {
    const game = this.store.get(gameCode);
    return game?.timerExpired ?? false;
  }

  _emitQuestion(gameCode) {
    const game = this.store.get(gameCode);
    const question = game.quiz?.questions?.[game.questionIndex];
    const timeLimit = (question?.timeLimit ?? this.config.TIMER_DEFAULT) * 1000;

    this.timerManager.startTimer(gameCode, timeLimit, () => {
      this.store.update(gameCode, { timerExpired: true });
    });

    return {
      question: this._sanitizeQuestion(question),
      questionIndex: game.questionIndex,
      totalQuestions: (game.quiz?.questions ?? []).length,
      endsAt: Date.now() + timeLimit,
    };
  }

  _sanitizeQuestion(question) {
    if (!question) return null;
    const { correctIndex, ...rest } = question;
    return rest;
  }

  _getParticipantsList(gameCode) {
    const game = this.store.get(gameCode);
    if (!game) return [];
    return Array.from(game.participants.values()).map((p) => ({
      socketId: p.socketId,
      nickname: p.nickname,
      score: p.score,
      streak: p.streak ?? 0,
    }));
  }
}
