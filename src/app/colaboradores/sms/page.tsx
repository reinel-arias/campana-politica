export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import SmsComposeClient from './SmsComposeClient';

interface Recipient {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  sexo: 'M' | 'F';
  direccion: string | null;
  barrio_nombre: string | null;
  comuna_nombre: string | null;
  puesto_nombre: string | null;
}

async function getRecipients(ids: number[]): Promise<Recipient[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.id, c.nombre, c.apellidos, c.telefono, c.sexo, c.direccion,
            b.nombre AS barrio_nombre, co.nombre AS comuna_nombre,
            pv.nombre AS puesto_nombre
     FROM colaboradores c
     LEFT JOIN barrios b ON c.barrio_id = b.id
     LEFT JOIN comunas co ON b.comuna_id = co.id
     LEFT JOIN puestos_votacion pv ON c.puesto_votacion_id = pv.id
     WHERE c.id IN (${placeholders})
     ORDER BY c.apellidos, c.nombre`,
    ids,
  );
  return rows as Recipient[];
}

export default async function SmsComposePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const ids = (searchParams.ids ?? '')
    .split(',')
    .map(Number)
    .filter(n => n > 0);

  if (!ids.length) notFound();

  const recipients = await getRecipients(ids);
  return <SmsComposeClient recipients={recipients} />;
}
