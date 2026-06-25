export const dynamic = 'force-dynamic';

import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Colaborador, Lider, Comuna, Barrio } from '@/types';
import ColaboradoresClient from './ColaboradoresClient';

async function getColaboradores(
  liderCedula?: string,
  barrioId?: string,
  comunaId?: string,
): Promise<Colaborador[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (liderCedula) {
    conditions.push('c.lider_cedula = ?');
    params.push(liderCedula);
  }
  if (barrioId) {
    conditions.push('c.barrio_id = ?');
    params.push(Number(barrioId));
  } else if (comunaId) {
    conditions.push('b.comuna_id = ?');
    params.push(Number(comunaId));
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  const query = `
    SELECT c.*,
           l.nombre AS lider_nombre, l.apellidos AS lider_apellidos,
           h.vehiculo, h.perifoneo, h.orador_publico, h.redes_sociales,
           b.nombre AS barrio_nombre, co.nombre AS comuna_nombre,
           pv.nombre AS puesto_nombre, pv.codigo AS puesto_codigo,
           z.codigo AS zona_codigo
    FROM colaboradores c
    JOIN lideres l ON c.lider_cedula = l.cedula
    LEFT JOIN habilidades_colaborador h ON h.colaborador_id = c.id
    LEFT JOIN barrios b ON c.barrio_id = b.id
    LEFT JOIN comunas co ON b.comuna_id = co.id
    LEFT JOIN puestos_votacion pv ON c.puesto_votacion_id = pv.id
    LEFT JOIN zonas z ON pv.zona_id = z.id
    ${where}
    ORDER BY c.apellidos, c.nombre
  `;
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as Colaborador[];
}

async function getLideres(): Promise<Lider[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM lideres ORDER BY apellidos, nombre');
  return rows as Lider[];
}

async function getComunas(): Promise<Comuna[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nombre FROM comunas ORDER BY nombre');
  return rows as Comuna[];
}

async function getBarrios(): Promise<Barrio[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, nombre, comuna_id FROM barrios ORDER BY nombre',
  );
  return rows as Barrio[];
}

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: { lider_cedula?: string; barrio_id?: string; comuna_id?: string };
}) {
  let colaboradores: Colaborador[] = [];
  let lideres: Lider[] = [];
  let comunas: Comuna[] = [];
  let barrios: Barrio[] = [];
  let dbError = false;

  try {
    [colaboradores, lideres, comunas, barrios] = await Promise.all([
      getColaboradores(searchParams.lider_cedula, searchParams.barrio_id, searchParams.comuna_id),
      getLideres(),
      getComunas(),
      getBarrios(),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Colaboradores</h1>
          <p className="text-slate-500 text-sm mt-1">{colaboradores.length} colaboradores encontrados</p>
        </div>
        <Link
          href="/colaboradores/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Colaborador
        </Link>
      </div>

      {dbError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
          Error de conexión a la base de datos.
        </div>
      )}

      <ColaboradoresClient
        colaboradores={colaboradores}
        lideres={lideres}
        comunas={comunas}
        barrios={barrios}
        selectedLider={searchParams.lider_cedula || ''}
        selectedComuna={searchParams.comuna_id || ''}
        selectedBarrio={searchParams.barrio_id || ''}
      />
    </div>
  );
}
