export const dynamic = 'force-dynamic';

import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Lider } from '@/types';
import LideresTable from './LideresTable';

async function getLideres(): Promise<Lider[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT l.*, COUNT(c.id) AS total_colaboradores
    FROM lideres l
    LEFT JOIN colaboradores c ON c.lider_cedula = l.cedula
    GROUP BY l.id
    ORDER BY l.apellidos, l.nombre
  `);
  return rows as Lider[];
}

export default async function LideresPage() {
  let lideres: Lider[] = [];
  let dbError = false;

  try {
    lideres = await getLideres();
  } catch {
    dbError = true;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Líderes</h1>
          <p className="text-slate-500 text-sm mt-1">{lideres.length} líderes registrados</p>
        </div>
        <Link
          href="/lideres/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Líder
        </Link>
      </div>

      {dbError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
          Error de conexión a la base de datos.
        </div>
      )}

      {lideres.length === 0 && !dbError ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2">No hay líderes registrados aún</p>
          <Link href="/lideres/nuevo" className="text-blue-600 hover:underline text-sm">
            Crear el primer líder
          </Link>
        </div>
      ) : (
        <LideresTable lideres={lideres} />
      )}
    </div>
  );
}
