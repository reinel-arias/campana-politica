export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getLiderDeSesion, getComunas, getZonas } from '../lider';
import CapturaEditarClient from './CapturaEditarClient';

export default async function CapturaEditarPage({ params }: { params: { id: string } }) {
  const lider = await getLiderDeSesion();
  if (!lider) redirect('/login');

  // Solo colaboradores del líder de la sesión
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT c.*, b.comuna_id, pv.zona_id,
           h.vehiculo, h.perifoneo, h.orador_publico, h.redes_sociales
    FROM colaboradores c
    LEFT JOIN barrios b ON c.barrio_id = b.id
    LEFT JOIN puestos_votacion pv ON c.puesto_votacion_id = pv.id
    LEFT JOIN habilidades_colaborador h ON h.colaborador_id = c.id
    WHERE c.id = ? AND c.lider_cedula = ?
  `, [params.id, lider.cedula]);

  if (rows.length === 0) redirect('/captura');
  const c = rows[0];

  const [comunas, zonas] = await Promise.all([getComunas(), getZonas()]);

  return (
    <CapturaEditarClient
      nombreLider={`${lider.nombre} ${lider.apellidos}`}
      colaboradorId={c.id}
      titulo={`${c.apellidos}, ${c.nombre}`}
      cedula={c.cedula}
      comunas={comunas}
      zonas={zonas}
      defaultValues={{
        cedula:             c.cedula,
        nombre:             c.nombre,
        apellidos:          c.apellidos,
        sexo:               c.sexo,
        // mismo formato que usa la edición de la app principal
        fecha_nacimiento:   c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toISOString().split('T')[0] : '',
        direccion:          c.direccion,
        telefono:           c.telefono,
        email:              c.email ?? '',
        lider_cedula:       lider.cedula,
        barrio_id:          c.barrio_id ?? null,
        puesto_votacion_id: c.puesto_votacion_id ?? null,
        initial_comuna_id:  c.comuna_id ?? null,
        initial_zona_id:    c.zona_id ?? null,
      }}
      habilidades={{
        vehiculo:       !!c.vehiculo,
        perifoneo:      !!c.perifoneo,
        orador_publico: !!c.orador_publico,
        redes_sociales: !!c.redes_sociales,
      }}
    />
  );
}
