import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/init.js';

export class QuizRepository {
  saveQuiz(title, questions) {
    const db = getDb();
    const id = uuidv4();
    db.prepare(
      'INSERT INTO quizzes (id, title, questions) VALUES (?, ?, ?)'
    ).run(id, title, JSON.stringify(questions));
    return id;
  }

  getQuiz(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (!row) return null;
    return { ...row, questions: JSON.parse(row.questions) };
  }

  listQuizzes(limit = 20, offset = 0) {
    const db = getDb();
    const rows = db.prepare(
      'SELECT id, title, created_at FROM quizzes ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);
    return rows;
  }

  deleteQuiz(id) {
    const db = getDb();
    const result = db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getQuizCount() {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
    return row.count;
  }
}

export const quizRepository = new QuizRepository();
