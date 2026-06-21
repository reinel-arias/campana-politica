export const dynamic = 'force-dynamic';

import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Lider } from '@/types';

async function getLideresConConteo(): Promise<Lider[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT l.*, COUNT(c.id) AS total_colaboradores
    FROM lideres l
    LEFT JOIN colaboradores c ON c.lider_cedula = l.cedula
    GROUP BY l.id
    ORDER BY l.apellidos, l.nombre
  `);
  return rows as Lider[];
}

async function getTotales() {
  const [r1] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM lideres');
  const [r2] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM colaboradores');
  return {
    lideres: (r1[0] as { total: number }).total,
    colaboradores: (r2[0] as { total: number }).total,
  };
}

export default async function DashboardPage() {
  let lideres: Lider[] = [];
  let totales = { lideres: 0, colaboradores: 0 };
  let dbError = false;

  try {
    [lideres, totales] = await Promise.all([getLideresConConteo(), getTotales()]);
  } catch {
    dbError = true;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen general de la campaña</p>
      </div>

      {dbError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          No se pudo conectar a la base de datos. Verifique que MariaDB esté corriendo en 127.0.0.1.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard label="Total Líderes"       value={totales.lideres}       href="/lideres"       color="blue" />
        <StatCard label="Total Colaboradores" value={totales.colaboradores} href="/colaboradores" color="emerald" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Líderes y colaboradores</h2>
        <Link
          href="/lideres/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Líder
        </Link>
      </div>

      {lideres.length === 0 && !dbError ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2">No hay líderes registrados</p>
          <Link href="/lideres/nuevo" className="text-blue-600 hover:underline text-sm">
            Crear el primer líder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lideres.map((lider) => (
            <LiderCard key={lider.id} lider={lider} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, href, color,
}: {
  label: string; value: number; href: string; color: 'blue' | 'emerald';
}) {
  const colors = {
    blue:    'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };
  return (
    <Link href={href} className={`block p-5 rounded-xl border ${colors[color]} hover:shadow-sm transition-shadow`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 font-medium opacity-80">{label}</p>
    </Link>
  );
}

function LiderCard({ lider }: { lider: Lider }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{lider.apellidos}, {lider.nombre}</h3>
          <p className="text-xs text-slate-400 mt-0.5">CC {lider.cedula}</p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {lider.total_colaboradores ?? 0}
        </span>
      </div>
      {lider.telefono && (
        <p className="text-xs text-slate-500 mt-3">{lider.telefono}</p>
      )}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/colaboradores?lider_cedula=${lider.cedula}`}
          className="text-xs text-blue-600 hover:underline"
        >
          Ver colaboradores
        </Link>
        <span className="text-slate-200">|</span>
        <Link
          href={`/lideres/${lider.id}`}
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          Editar
        </Link>
      </div>
    </div>
  );
}
