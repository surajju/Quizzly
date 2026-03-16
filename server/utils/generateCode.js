const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
