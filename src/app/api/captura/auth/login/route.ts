import { NextRequest, NextResponse } from 'next/server';
import { readUsers, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const users = readUsers('capturadores.txt');
  console.log(`[captura/login] usuarios cargados: ${users.size}, intento: "${username}"`);

  if (users.get(username) !== password) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('captura-session', createToken(username), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return res;
}
