import { useMemo } from 'react'

export function useLeaderboard(leaderboard) {
  return useMemo(() => {
    if (!leaderboard?.length) return []
    return [...leaderboard].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
  }, [leaderboard])
}
