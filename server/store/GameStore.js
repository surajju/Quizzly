class GameStore {
  constructor() {
    this.games = new Map();
  }

  create(gameCode, gameData) {
    this.games.set(gameCode, {
      ...gameData,
      participants: new Map(),
      answers: new Map(),
    });
  }

  get(gameCode) {
    return this.games.get(gameCode) ?? null;
  }

  update(gameCode, partial) {
    const game = this.games.get(gameCode);
    if (!game) return;
    Object.assign(game, partial);
  }

  delete(gameCode) {
    this.games.delete(gameCode);
  }

  addPlayer(gameCode, socketId, nickname) {
    const game = this.games.get(gameCode);
    if (!game) return;
    game.participants.set(socketId, {
      socketId,
      nickname,
      score: 0,
      streak: 0,
      prevRank: null,
      wasCorrect: false,
      pointsEarned: 0,
      connected: true,
    });
  }

  markDisconnected(gameCode, socketId) {
    const game = this.games.get(gameCode);
    if (!game) return;
    const participant = game.participants.get(socketId);
    if (participant) {
      participant.connected = false;
      participant.disconnectedAt = Date.now();
    }
  }

  reconnectPlayer(gameCode, oldSocketId, newSocketId) {
    const game = this.games.get(gameCode);
    if (!game) return null;
    const participant = game.participants.get(oldSocketId);
    if (!participant || participant.connected !== false) return null;

    const { score, streak, prevRank, nickname, wasCorrect, pointsEarned } = participant;
    const newParticipant = {
      socketId: newSocketId,
      nickname,
      score,
      streak: streak ?? 0,
      prevRank: prevRank ?? null,
      wasCorrect: wasCorrect ?? false,
      pointsEarned: pointsEarned ?? 0,
      connected: true,
    };
    game.participants.delete(oldSocketId);
    game.participants.set(newSocketId, newParticipant);

    // Migrate answer if player had submitted before disconnect
    if (game.answers.has(oldSocketId)) {
      const answer = game.answers.get(oldSocketId);
      game.answers.delete(oldSocketId);
      game.answers.set(newSocketId, answer);
    }

    return newParticipant;
  }

  findDisconnectedPlayer(gameCode, nickname) {
    const game = this.games.get(gameCode);
    if (!game) return null;
    for (const [socketId, p] of game.participants) {
      if (p.connected === false && p.nickname === nickname) {
        return { socketId, ...p };
      }
    }
    return null;
  }

  removePlayer(gameCode, socketId) {
    const game = this.games.get(gameCode);
    if (!game) return;
    game.participants.delete(socketId);
  }

  setAnswer(gameCode, socketId, answerData) {
    const game = this.games.get(gameCode);
    if (!game) return;
    game.answers.set(socketId, answerData);
  }

  clearAnswers(gameCode) {
    const game = this.games.get(gameCode);
    if (!game) return;
    game.answers.clear();
  }

  updateScore(gameCode, socketId, points) {
    const game = this.games.get(gameCode);
    if (!game) return;
    const p = game.participants.get(socketId);
    if (p) p.score += points;
  }

  updateStreak(gameCode, socketId, correct) {
    const game = this.games.get(gameCode);
    if (!game) return;
    const p = game.participants.get(socketId);
    if (!p) return;
    if (correct) {
      p.streak = (p.streak || 0) + 1;
    } else {
      p.streak = 0;
    }
  }

  getAll() {
    return Array.from(this.games.entries()).map(([code, game]) => ({
      gameCode: code,
      ...game,
    }));
  }
}

export const gameStore = new GameStore();
