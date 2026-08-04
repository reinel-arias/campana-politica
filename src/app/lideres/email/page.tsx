export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import EmailComposeClient from './EmailComposeClient';

interface Recipient {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  direccion: string;
}

async function getRecipients(ids: number[]): Promise<Recipient[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, nombre, apellidos, email, direccion FROM lideres WHERE id IN (${placeholders}) ORDER BY apellidos, nombre`,
    ids,
  );
  return rows as Recipient[];
}

export default async function LideresEmailPage({
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
  return <EmailComposeClient recipients={recipients} />;
}
