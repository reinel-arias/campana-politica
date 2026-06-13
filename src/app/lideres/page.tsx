import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Lider } from '@/types';
import DeleteLiderButton from './DeleteLiderButton';

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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-slate-600 font-semibold">Cédula</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold">Nombre</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden sm:table-cell">Teléfono</th>
                <th className="text-center px-5 py-3 text-slate-600 font-semibold">Colaboradores</th>
                <th className="text-right px-5 py-3 text-slate-600 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lideres.map((lider) => (
                <tr key={lider.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{lider.cedula}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{lider.apellidos}, {lider.nombre}</p>
                    {lider.direccion && <p className="text-xs text-slate-400 mt-0.5">{lider.direccion}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{lider.telefono}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Link
                      href={`/colaboradores?lider_cedula=${lider.cedula}`}
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-xs font-bold rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {lider.total_colaboradores ?? 0}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/lideres/${lider.id}`}
                        className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteLiderButton id={lider.id} nombre={`${lider.nombre} ${lider.apellidos}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
