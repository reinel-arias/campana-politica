export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Colaborador, Gestion } from '@/types';
import GestionClient from './GestionClient';

async function getColaborador(id: string): Promise<Colaborador | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.*, b.nombre AS barrio_nombre, co.nombre AS comuna_nombre,
            l.nombre AS lider_nombre, l.apellidos AS lider_apellidos
     FROM colaboradores c
     LEFT JOIN barrios b ON c.barrio_id = b.id
     LEFT JOIN comunas co ON b.comuna_id = co.id
     LEFT JOIN lideres l ON c.lider_cedula = l.cedula
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] as Colaborador ?? null;
}

async function getGestiones(colaboradorId: string): Promise<Gestion[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, colaborador_id, descripcion,
            DATE_FORMAT(fecha_limite, '%Y-%m-%d') AS fecha_limite,
            gestionado,
            DATE_FORMAT(fecha_ejecucion, '%Y-%m-%d') AS fecha_ejecucion,
            creado_en
     FROM gestiones
     WHERE colaborador_id = ?
     ORDER BY fecha_limite ASC`,
    [colaboradorId]
  );
  return rows.map(r => ({ ...r, gestionado: r.gestionado === 1 })) as Gestion[];
}

export default async function GestionDetallePage({ params }: { params: { colaborador_id: string } }) {
  const [colaborador, gestiones] = await Promise.all([
    getColaborador(params.colaborador_id),
    getGestiones(params.colaborador_id),
  ]);

  if (!colaborador) notFound();

  return <GestionClient colaborador={colaborador} initialGestiones={gestiones} />;
}
