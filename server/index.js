import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { config } from './config/index.js';
import { initSocketServer } from './transport/socketServer.js';
import quizRoutes from './routes/quizRoutes.js';
import { logger } from './utils/logger.js';
import { getDb } from './db/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

getDb();

app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(express.json());
app.use(quizRoutes);

if (config.IS_PRODUCTION) {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
