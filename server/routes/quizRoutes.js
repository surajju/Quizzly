import { Router } from 'express';
import { gameStore } from '../store/index.js';
import { GameEngine } from '../engine/GameEngine.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { templates } from '../data/templates.js';

const router = Router();
const engine = new GameEngine(gameStore, config);

router.post('/api/quiz', (req, res) => {
  try {
    const quiz = req.body;
    if (!quiz?.questions?.length) {
      return res.status(400).json({ error: 'Quiz must have questions' });
    }
    const { gameCode, hostToken } = engine.createGame(quiz);
    logger.info(`Quiz created via REST: ${gameCode}`);
    res.json({ gameCode, hostToken });
  } catch (err) {
    logger.error('POST /api/quiz error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/quiz/:gameCode', (req, res) => {
  try {
    const { gameCode } = req.params;
    const state = engine.getGameState(gameCode);
    if (!state) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(state);
  } catch (err) {
    logger.error('GET /api/quiz/:gameCode error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/templates', (req, res) => {
  const list = templates.map(({ id, title, category, icon, description, questions }) => ({
    id, title, category, icon, description, questionCount: questions.length
  }));
  res.json(list);
});

router.get('/api/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

export default router;
