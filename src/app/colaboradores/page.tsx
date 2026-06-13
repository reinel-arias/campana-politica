import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Colaborador, Lider } from '@/types';
import ColaboradoresClient from './ColaboradoresClient';

async function getColaboradores(liderCedula?: string): Promise<Colaborador[]> {
  let query = `
    SELECT c.*,
           l.nombre AS lider_nombre, l.apellidos AS lider_apellidos,
           h.vehiculo, h.perifoneo, h.orador_publico, h.redes_sociales
    FROM colaboradores c
    JOIN lideres l ON c.lider_cedula = l.cedula
    LEFT JOIN habilidades_colaborador h ON h.colaborador_id = c.id
  `;
  const params: string[] = [];
  if (liderCedula) {
    query += ' WHERE c.lider_cedula = ?';
    params.push(liderCedula);
  }
  query += ' ORDER BY c.apellidos, c.nombre';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as Colaborador[];
}

async function getLideres(): Promise<Lider[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM lideres ORDER BY apellidos, nombre');
  return rows as Lider[];
}

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: { lider_cedula?: string };
}) {
  let colaboradores: Colaborador[] = [];
  let lideres: Lider[] = [];
  let dbError = false;

  try {
    [colaboradores, lideres] = await Promise.all([
      getColaboradores(searchParams.lider_cedula),
      getLideres(),
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
        selectedLider={searchParams.lider_cedula || ''}
      />
    </div>
  );
}
