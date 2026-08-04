export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Lider, Comuna, Zona } from '@/types';
import { verifyToken } from '@/lib/auth';
import CapturaClient from './CapturaClient';

async function getLideres(): Promise<Lider[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM lideres ORDER BY apellidos, nombre',
  );
  return rows as Lider[];
}

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

async function getNombreLider(usuario: string): Promise<string> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT nombre, apellidos FROM lideres WHERE usuario = ?',
    [usuario],
  );
  if (rows.length === 0) return usuario;
  return `${rows[0].nombre} ${rows[0].apellidos}`;
}

export default async function CapturaPage() {
  const token = cookies().get('captura-session')?.value;
  const usuario = token ? verifyToken(token) : null;
  const nombreLider = usuario ? await getNombreLider(usuario) : '';

  const [lideres, comunas, zonas] = await Promise.all([getLideres(), getComunas(), getZonas()]);
  return <CapturaClient lideres={lideres} comunas={comunas} zonas={zonas} nombreLider={nombreLider} />;
}
