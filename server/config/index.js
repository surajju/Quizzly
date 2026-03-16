const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
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
  IS_PRODUCTION: isProduction,
};
