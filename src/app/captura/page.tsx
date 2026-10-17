export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getLiderDeSesion } from './lider';
import CapturaListaClient, { ColaboradorFila } from './CapturaListaClient';

function calcularEdad(fecha: Date | null): number {
  if (!fecha) return 0;
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

async function getColaboradoresDeLider(liderCedula: string): Promise<ColaboradorFila[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT c.id, c.nombre, c.apellidos, c.sexo, c.telefono, c.fecha_nacimiento,
           b.nombre AS barrio_nombre,
           pv.nombre AS puesto_nombre, pv.codigo AS puesto_codigo, z.codigo AS zona_codigo
    FROM colaboradores c
    LEFT JOIN barrios b ON c.barrio_id = b.id
    LEFT JOIN puestos_votacion pv ON c.puesto_votacion_id = pv.id
    LEFT JOIN zonas z ON pv.zona_id = z.id
    WHERE c.lider_cedula = ?
    ORDER BY c.apellidos, c.nombre
  `, [liderCedula]);

  return rows.map((r) => ({
    id:            r.id,
    nombre:        r.nombre,
    apellidos:     r.apellidos,
    sexo:          r.sexo,
    telefono:      r.telefono,
    edad:          calcularEdad(r.fecha_nacimiento),
    barrio_nombre: r.barrio_nombre ?? null,
    puesto:        r.puesto_nombre ? `${r.zona_codigo}-${r.puesto_codigo} ${r.puesto_nombre}` : null,
  }));
}

export default async function CapturaPage() {
  const lider = await getLiderDeSesion();
  if (!lider) redirect('/login');

  const colaboradores = await getColaboradoresDeLider(lider.cedula);
  return (
    <CapturaListaClient
      nombreLider={`${lider.nombre} ${lider.apellidos}`}
      colaboradores={colaboradores}
    />
  );
}
