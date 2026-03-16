import { config } from '../config'

const apiBase = config.API_BASE

export async function createQuiz(quiz) {
  const res = await fetch(`${apiBase}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz),
  })
  if (!res.ok) throw new Error('Failed to create quiz')
  return res.json()
}

export async function getGameState(gameCode) {
  const res = await fetch(`${apiBase}/quiz/${gameCode}`)
  if (!res.ok) throw new Error('Failed to fetch game state')
  return res.json()
}
