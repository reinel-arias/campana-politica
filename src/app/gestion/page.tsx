export const dynamic = 'force-dynamic';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { GestionResumen, Colaborador } from '@/types';
import GestionPageClient from './GestionPageClient';

async function getResumen(): Promise<GestionResumen[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      c.id AS colaborador_id,
      c.nombre AS colaborador_nombre,
      c.apellidos AS colaborador_apellidos,
      c.cedula AS colaborador_cedula,
      b.nombre AS barrio_nombre,
      COUNT(*) AS total,
      SUM(CASE WHEN g.gestionado = 0 THEN 1 ELSE 0 END) AS pendientes,
      SUM(CASE WHEN g.gestionado = 0 AND g.fecha_limite < CURDATE() THEN 1 ELSE 0 END) AS vencidas,
      MIN(CASE WHEN g.gestionado = 0 THEN DATE_FORMAT(g.fecha_limite, '%Y-%m-%d') END) AS proxima_fecha
    FROM gestiones g
    JOIN colaboradores c ON g.colaborador_id = c.id
    LEFT JOIN barrios b ON c.barrio_id = b.id
    GROUP BY c.id, c.nombre, c.apellidos, c.cedula, b.nombre
    ORDER BY proxima_fecha IS NULL, proxima_fecha ASC
  `);
  return rows as GestionResumen[];
}

async function getAllColaboradores(): Promise<Pick<Colaborador, 'id' | 'nombre' | 'apellidos' | 'cedula'>[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, nombre, apellidos, cedula FROM colaboradores ORDER BY apellidos, nombre`
  );
  return rows as Pick<Colaborador, 'id' | 'nombre' | 'apellidos' | 'cedula'>[];
}

export default async function GestionPage() {
  const [resumen, colaboradores] = await Promise.all([getResumen(), getAllColaboradores()]);

  const totalPendientes = resumen.reduce((s, r) => s + Number(r.pendientes), 0);
  const totalVencidas = resumen.reduce((s, r) => s + Number(r.vencidas), 0);

  return (
    <GestionPageClient
      resumen={resumen}
      colaboradores={colaboradores}
      totalPendientes={totalPendientes}
      totalVencidas={totalVencidas}
    />
  );
}
