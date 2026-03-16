import { Router } from 'express';
import { gameStore } from '../store/index.js';
import { GameEngine } from '../engine/GameEngine.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { templates } from '../data/templates.js';
import { quizRepository } from '../store/QuizRepository.js';
import { resultRepository } from '../store/ResultRepository.js';
import { generateQuestions } from '../services/aiGenerator.js';

const router = Router();
const engine = new GameEngine(gameStore, config);

router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.post('/api/quiz', (req, res) => {
  try {
    const quiz = req.body;
    if (!quiz?.questions?.length) {
      return res.status(400).json({ error: 'Quiz must have questions' });
    }
    const quizId = quizRepository.saveQuiz(quiz.title || 'Untitled Quiz', quiz.questions);
    const { gameCode, hostToken } = engine.createGame(quiz);
    logger.info(`Quiz created via REST: ${gameCode} (saved as ${quizId})`);
    res.json({ gameCode, hostToken, quizId });
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

router.post('/api/generate', async (req, res) => {
  try {
    const { topic, count } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    const numQuestions = Math.min(Math.max(parseInt(count) || 5, 1), 15);
    const questions = await generateQuestions(topic.trim(), numQuestions);
    if (!questions.length) {
      return res.status(500).json({ error: 'Failed to generate questions' });
    }
    logger.info(`AI generated ${questions.length} questions for "${topic}"`);
    res.json({ questions, topic: topic.trim() });
  } catch (err) {
    logger.error('POST /api/generate error:', err.message);
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

router.get('/api/quizzes', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const quizzes = quizRepository.listQuizzes(limit, offset);
    const total = quizRepository.getQuizCount();
    res.json({ quizzes, total });
  } catch (err) {
    logger.error('GET /api/quizzes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/quizzes/:id', (req, res) => {
  try {
    const quiz = quizRepository.getQuiz(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    logger.error('GET /api/quizzes/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/quizzes/:id', (req, res) => {
  try {
    const deleted = quizRepository.deleteQuiz(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ ok: true });
  } catch (err) {
    logger.error('DELETE /api/quizzes/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/results/:gameCode', (req, res) => {
  try {
    const results = resultRepository.getResults(req.params.gameCode);
    if (!results.length) return res.status(404).json({ error: 'No results found' });
    res.json(results);
  } catch (err) {
    logger.error('GET /api/results/:gameCode error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/results', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const games = resultRepository.getRecentGames(limit);
    res.json(games);
  } catch (err) {
    logger.error('GET /api/results error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
