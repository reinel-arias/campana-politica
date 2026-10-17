import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Comuna, Zona } from '@/types';
import { verifyToken } from '@/lib/auth';

export interface LiderSesion { nombre: string; apellidos: string; cedula: string }

// Líder dueño de la cookie captura-session (o null si no hay sesión válida)
export async function getLiderDeSesion(): Promise<LiderSesion | null> {
  const token = cookies().get('captura-session')?.value;
  const usuario = token ? verifyToken(token, 'captura') : null;
  if (!usuario) return null;
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT nombre, apellidos, cedula FROM lideres WHERE usuario = ?',
    [usuario],
  );
  return rows.length > 0 ? rows[0] as LiderSesion : null;
}

export async function getComunas(): Promise<Comuna[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, nombre FROM comunas ORDER BY nombre',
  );
  return rows as Comuna[];
}

export async function getZonas(): Promise<Zona[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, codigo FROM zonas ORDER BY codigo',
  );
  return rows as Zona[];
}
