import { config } from '../config/index.js';

const { BASE_POINTS, SPEED_BONUS_MAX } = config.SCORING;
const STREAK_MULT = config.STREAK;

function getStreakMultiplier(streak) {
  if (streak >= 4) return STREAK_MULT[4];
  return STREAK_MULT[streak] ?? 1;
}

const strategies = {
  standard({ correct, timeLeft, timeLimit }) {
    if (!correct) return 0;
    const speedBonus = Math.round((timeLeft / timeLimit) * SPEED_BONUS_MAX);
    return BASE_POINTS + speedBonus;
  },
  streakBased({ correct, timeLeft, timeLimit, streak }) {
    const base = strategies.standard({ correct, timeLeft, timeLimit });
    if (base === 0) return 0;
    const mult = getStreakMultiplier(streak || 1);
    return Math.round(base * mult);
  },
  flat({ correct }) {
    return correct ? BASE_POINTS : 0;
  },
};

export function calcScore(strategyName, params) {
  const strategy = strategies[strategyName] ?? strategies.streakBased;
  return strategy(params);
}
