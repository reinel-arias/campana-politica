import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyCredentials, createToken } from '@/lib/auth';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8 horas
};

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  // 1. Usuarios de la app principal (users.txt) → acceso total
  if (verifyCredentials(username, password)) {
    const res = NextResponse.json({ ok: true, redirect: '/' });
    res.cookies.set('session', createToken(username, 'main'), COOKIE_OPTS);
    res.cookies.set('captura-session', '', { maxAge: 0, path: '/' });
    return res;
  }

  // 2. Líderes (tabla lideres) → portal de captura
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT clave FROM lideres WHERE usuario = ?',
    [username.trim()]
  );

  if (rows.length > 0 && rows[0].clave === password) {
    const res = NextResponse.json({ ok: true, redirect: '/captura' });
    res.cookies.set('captura-session', createToken(username.trim(), 'captura'), COOKIE_OPTS);
    res.cookies.set('session', '', { maxAge: 0, path: '/' });
    return res;
  }

  return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
}
