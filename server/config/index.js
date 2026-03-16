export const config = {
  PORT: 3001,
  CORS_ORIGINS: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  TIMER_DEFAULT: 20,
  SCORING: {
    BASE_POINTS: 100,
    SPEED_BONUS_MAX: 50,
  },
  STREAK: {
    2: 1.2,
    3: 1.5,
    4: 2.0,
  },
  GAME_CODE_LENGTH: 6,
};
