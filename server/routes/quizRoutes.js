import { Router } from 'express';
import multer from 'multer';
import { gameStore } from '../store/index.js';
import { GameEngine } from '../engine/GameEngine.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { templates } from '../data/templates.js';
import { quizRepository } from '../store/QuizRepository.js';
import { resultRepository } from '../store/ResultRepository.js';
import { generateQuestions, generateFromDocument } from '../services/aiGenerator.js';
import { extractText, isSupportedType } from '../services/documentParser.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

router.post('/api/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    const pastedText = req.body.text;
    const count = Math.min(Math.max(parseInt(req.body.count) || 5, 1), 15);

    let documentText;

    if (file) {
      if (!isSupportedType(file.mimetype)) {
        return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' });
      }
      documentText = await extractText(file.buffer, file.mimetype);
    } else if (pastedText?.trim()) {
      documentText = pastedText.trim();
      if (documentText.length < 50) {
        return res.status(400).json({ error: 'Text is too short. Please provide more content.' });
      }
      if (documentText.length > 15000) {
        documentText = documentText.slice(0, 15000);
      }
    } else {
      return res.status(400).json({ error: 'Please upload a file or paste some text.' });
    }

    const questions = await generateFromDocument(documentText, count);
    if (!questions.length) {
      return res.status(500).json({ error: 'Failed to generate questions from the document.' });
    }

    const source = file ? file.originalname : 'Pasted text';
    logger.info(`AI generated ${questions.length} questions from document: "${source}"`);
    res.json({ questions, source });
  } catch (err) {
    logger.error('POST /api/generate-from-document error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
    }
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
