import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/index.js';
import { initSocketServer } from './transport/socketServer.js';
import quizRoutes from './routes/quizRoutes.js';
import { logger } from './utils/logger.js';

const app = express();
app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(express.json());
app.use(quizRoutes);

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
