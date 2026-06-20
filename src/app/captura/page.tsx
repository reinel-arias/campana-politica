import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Lider, Comuna } from '@/types';
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

export default async function CapturaPage() {
  const [lideres, comunas] = await Promise.all([getLideres(), getComunas()]);
  return <CapturaClient lideres={lideres} comunas={comunas} />;
}
