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
    });
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
