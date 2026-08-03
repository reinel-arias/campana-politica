import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT clave FROM lideres WHERE usuario = ?',
    [username.trim()]
  );

  if (rows.length === 0 || rows[0].clave !== password) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('captura-session', createToken(username), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return res;
}
