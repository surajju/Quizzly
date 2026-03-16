import { getDb } from '../db/init.js';

export class ResultRepository {
  saveResults(gameCode, quizTitle, leaderboard, totalQuestions) {
    const db = getDb();
    const insert = db.prepare(
      'INSERT INTO game_results (game_code, quiz_title, nickname, score, rank, total_questions) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const insertMany = db.transaction((entries) => {
      for (const entry of entries) {
        insert.run(
          gameCode,
          quizTitle,
          entry.nickname,
          entry.score,
          entry.rank,
          totalQuestions
        );
      }
    });

    insertMany(leaderboard);
  }

  getResults(gameCode) {
    const db = getDb();
    return db.prepare(
      'SELECT nickname, score, rank, total_questions, finished_at FROM game_results WHERE game_code = ? ORDER BY rank ASC'
    ).all(gameCode);
  }

  getRecentGames(limit = 20) {
    const db = getDb();
    return db.prepare(`
      SELECT game_code, quiz_title, COUNT(*) as player_count, MAX(score) as top_score, MIN(finished_at) as played_at
      FROM game_results
      GROUP BY game_code
      ORDER BY played_at DESC
      LIMIT ?
    `).all(limit);
  }
}

export const resultRepository = new ResultRepository();
