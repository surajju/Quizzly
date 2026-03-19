import { logger } from '../utils/logger.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a quiz question generator. Given a topic, generate quiz questions in JSON format.

Each question must have:
- "text": the question string
- "options": array of exactly 4 answer choices
- "correctIndex": index (0-3) of the correct answer
- "timeLimit": 15 or 20 seconds depending on difficulty

Rules:
- Questions should be factual and unambiguous
- Wrong options should be plausible but clearly incorrect
- Vary difficulty: mix easy, medium, and hard questions
- Keep questions concise (under 120 characters)
- Keep options concise (under 60 characters each)
- Return ONLY a valid JSON array of question objects, no markdown, no explanation`;

export async function generateQuestions(topic, count = 5) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Generate ${count} quiz questions about: "${topic}"`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: SYSTEM_PROMPT },
          { text: prompt },
        ]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error('Gemini API error:', errText);
    let msg = 'AI generation failed';
    try {
      const errData = JSON.parse(errText);
      if (errData.error?.code === 429) {
        msg = 'AI rate limit reached. Please wait a moment and try again.';
      } else if (errData.error?.message) {
        msg = errData.error.message;
      }
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from AI');
  }

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const questions = JSON.parse(cleaned);

  if (!Array.isArray(questions)) {
    throw new Error('AI returned invalid format');
  }

  return sanitizeQuestions(questions, count);
}

function sanitizeQuestions(questions, count) {
  return questions.slice(0, count).map((q) => ({
    text: String(q.text || '').slice(0, 200),
    options: (q.options || []).slice(0, 4).map((o) => String(o).slice(0, 100)),
    correctIndex: Math.min(Math.max(parseInt(q.correctIndex) || 0, 0), 3),
    timeLimit: [10, 15, 20, 30].includes(q.timeLimit) ? q.timeLimit : 15,
  })).filter((q) => q.text && q.options.length >= 2);
}

const DOCUMENT_PROMPT = `You are a quiz question generator. You will be given the text content of a document.
Generate quiz questions BASED ONLY on the information in the provided document.

Each question must have:
- "text": the question string
- "options": array of exactly 4 answer choices
- "correctIndex": index (0-3) of the correct answer
- "timeLimit": 15 or 20 seconds depending on difficulty

Rules:
- Questions must be answerable using ONLY the document content
- Questions should test comprehension of the key concepts in the document
- Wrong options should be plausible but clearly incorrect based on the document
- Vary difficulty: mix easy, medium, and hard questions
- Keep questions concise (under 120 characters)
- Keep options concise (under 60 characters each)
- Return ONLY a valid JSON array of question objects, no markdown, no explanation`;

export async function generateFromDocument(documentText, count = 5) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  if (!documentText || documentText.trim().length < 50) {
    throw new Error('Document text is too short to generate questions from');
  }

  const prompt = `Generate ${count} quiz questions from the following document:\n\n---\n${documentText}\n---`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: DOCUMENT_PROMPT },
          { text: prompt },
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error('Gemini API error (document):', errText);
    let msg = 'AI generation failed';
    try {
      const errData = JSON.parse(errText);
      if (errData.error?.code === 429) {
        msg = 'AI rate limit reached. Please wait a moment and try again.';
      } else if (errData.error?.message) {
        msg = errData.error.message;
      }
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from AI');
  }

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const questions = JSON.parse(cleaned);

  if (!Array.isArray(questions)) {
    throw new Error('AI returned invalid format');
  }

  return sanitizeQuestions(questions, count);
}
