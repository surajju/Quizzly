export class TimerManager {
  constructor() {
    this.timers = new Map();
  }

  startTimer(gameCode, durationMs, onExpire) {
    this.stopTimer(gameCode);
    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      this.timers.delete(gameCode);
      onExpire();
    }, durationMs);
    this.timers.set(gameCode, { timeoutId, startTime, durationMs });
  }

  stopTimer(gameCode) {
    const entry = this.timers.get(gameCode);
    if (entry) {
      clearTimeout(entry.timeoutId);
      this.timers.delete(gameCode);
    }
  }

  getRemainingTime(gameCode) {
    const entry = this.timers.get(gameCode);
    if (!entry) return 0;
    const elapsed = Date.now() - entry.startTime;
    const remaining = entry.durationMs - elapsed;
    return Math.max(0, remaining);
  }

  cleanup(gameCode) {
    this.stopTimer(gameCode);
  }
}
