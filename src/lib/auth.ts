import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SECRET = process.env.AUTH_SECRET ?? 'campana-key-2024';

export function readUsers(): Map<string, string> {
  const filePath = path.join(process.cwd(), 'users.txt');
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const map = new Map<string, string>();
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const i = t.indexOf(':');
    if (i < 1) continue;
    map.set(t.slice(0, i), t.slice(i + 1));
  }
  return map;
}

export function verifyCredentials(username: string, password: string): boolean {
  return readUsers().get(username) === password;
}

function hmacHex(username: string): string {
  return crypto.createHmac('sha256', SECRET).update(username).digest('hex');
}

export function createToken(username: string): string {
  return Buffer.from(`${username}:${hmacHex(username)}`).toString('base64url');
}

export function verifyToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const i = raw.lastIndexOf(':');
    const username = raw.slice(0, i);
    const hash = raw.slice(i + 1);
    return hash === hmacHex(username) ? username : null;
  } catch {
    return null;
  }
}
