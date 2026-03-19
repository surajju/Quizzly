import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { logger } from '../utils/logger.js';

const MAX_TEXT_LENGTH = 15000;

const SUPPORTED_TYPES = [
  'application/pdf',
  'text/plain',
];

export function isSupportedType(mimetype) {
  return SUPPORTED_TYPES.includes(mimetype);
}

export async function extractText(buffer, mimetype) {
  if (!buffer || !buffer.length) {
    throw new Error('Empty file');
  }

  let text = '';

  if (mimetype === 'application/pdf') {
    try {
      const data = await pdf(buffer);
      text = data.text || '';
    } catch (err) {
      logger.error('PDF parse error:', err.message);
      throw new Error('Failed to read PDF. Make sure it contains selectable text (not scanned images).');
    }
  } else if (mimetype === 'text/plain') {
    text = buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type: ${mimetype}. Please upload a PDF or TXT file.`);
  }

  text = text.replace(/\s+/g, ' ').trim();

  if (!text || text.length < 50) {
    throw new Error('Document has too little text to generate questions from. Please provide more content.');
  }

  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH);
    logger.info(`Document text truncated to ${MAX_TEXT_LENGTH} chars`);
  }

  return text;
}
