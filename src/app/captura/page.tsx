export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Comuna, Zona } from '@/types';
import { verifyToken } from '@/lib/auth';
import CapturaClient from './CapturaClient';

async function getComunas(): Promise<Comuna[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, nombre FROM comunas ORDER BY nombre',
  );
  return rows as Comuna[];
}

async function getZonas(): Promise<Zona[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, codigo FROM zonas ORDER BY codigo',
  );
  return rows as Zona[];
}

async function getLiderByUsuario(usuario: string): Promise<{ nombre: string; apellidos: string; cedula: string } | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT nombre, apellidos, cedula FROM lideres WHERE usuario = ?',
    [usuario],
  );
  return rows.length > 0 ? rows[0] as { nombre: string; apellidos: string; cedula: string } : null;
}

export default async function CapturaPage() {
  const token = cookies().get('captura-session')?.value;
  const usuario = token ? verifyToken(token) : null;
  const lider = usuario ? await getLiderByUsuario(usuario) : null;
  const nombreLider = lider ? `${lider.nombre} ${lider.apellidos}` : '';
  const liderCedula = lider?.cedula ?? '';

  const [comunas, zonas] = await Promise.all([getComunas(), getZonas()]);
  return <CapturaClient comunas={comunas} zonas={zonas} nombreLider={nombreLider} liderCedula={liderCedula} />;
}
