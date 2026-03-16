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

export async function getTemplates() {
  const res = await fetch(`${apiBase}/templates`)
  if (!res.ok) throw new Error('Failed to fetch templates')
  return res.json()
}

export async function getTemplate(id) {
  const res = await fetch(`${apiBase}/templates/${id}`)
  if (!res.ok) throw new Error('Failed to fetch template')
  return res.json()
}

export async function generateQuestions(topic, count = 5) {
  const res = await fetch(`${apiBase}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, count }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to generate questions')
  return data
}
