export const dynamic = 'force-dynamic';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Lider, Comuna, Zona } from '@/types';
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

export default async function CapturaPage() {
  const [lideres, comunas, zonas] = await Promise.all([getLideres(), getComunas(), getZonas()]);
  return <CapturaClient lideres={lideres} comunas={comunas} zonas={zonas} />;
}
