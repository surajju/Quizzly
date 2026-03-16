export function computeLeaderboard(participants) {
  const entries = Array.from(participants.values());
  entries.sort((a, b) => b.score - a.score);

  let rank = 1;
  const result = [];
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].score < entries[i - 1].score) {
      rank = i + 1;
    }
    result.push({
      socketId: entries[i].socketId,
      nickname: entries[i].nickname,
      score: entries[i].score,
      rank,
      prevRank: entries[i].prevRank ?? null,
      streak: entries[i].streak ?? 0,
      wasCorrect: entries[i].wasCorrect ?? false,
      pointsEarned: entries[i].pointsEarned ?? 0,
    });
    entries[i].prevRank = rank;
  }
  return result;
}
