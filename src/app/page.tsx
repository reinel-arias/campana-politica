export const dynamic = 'force-dynamic';

import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function getTotales() {
  const [[r1], [r2], [r3]] = await Promise.all([
    pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM lideres'),
    pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM colaboradores'),
    pool.query<RowDataPacket[]>(`
      SELECT
        SUM(gestionado = 1)                                      AS realizados,
        SUM(gestionado = 0 AND fecha_limite >= CURDATE())        AS pendientes,
        SUM(gestionado = 0 AND fecha_limite < CURDATE())         AS vencidos
      FROM gestiones
    `),
  ]);
  return {
    lideres:      (r1[0] as { total: number }).total,
    colaboradores:(r2[0] as { total: number }).total,
    realizados:   Number((r3[0] as { realizados: number | null }).realizados ?? 0),
    pendientes:   Number((r3[0] as { pendientes: number | null }).pendientes ?? 0),
    vencidos:     Number((r3[0] as { vencidos: number | null }).vencidos    ?? 0),
  };
}

export default async function DashboardPage() {
  let totales = { lideres: 0, colaboradores: 0, realizados: 0, pendientes: 0, vencidos: 0 };
  let dbError = false;

  try {
    totales = await getTotales();
  } catch {
    dbError = true;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen general de la campaña</p>
      </div>

      {dbError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          No se pudo conectar a la base de datos. Verifique que MariaDB esté corriendo en 127.0.0.1.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <StatCard label="Total Líderes"       value={totales.lideres}       href="/lideres"       color="blue" />
        <StatCard label="Total Colaboradores" value={totales.colaboradores} href="/colaboradores" color="emerald" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Favores Pendientes" value={totales.pendientes} href="/gestion" color="amber" />
        <StatCard label="Favores Vencidos"   value={totales.vencidos}   href="/gestion" color="red" />
        <StatCard label="Favores Realizados" value={totales.realizados} href="/gestion" color="teal" />
      </div>
    </div>
  );
}

function StatCard({
  label, value, href, color,
}: {
  label: string; value: number; href: string; color: 'blue' | 'emerald' | 'amber' | 'red' | 'teal';
}) {
  const colors = {
    blue:    'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber:   'bg-amber-50 border-amber-100 text-amber-700',
    red:     'bg-red-50 border-red-100 text-red-700',
    teal:    'bg-teal-50 border-teal-100 text-teal-700',
  };
  return (
    <Link href={href} className={`block p-5 rounded-xl border ${colors[color]} hover:shadow-sm transition-shadow`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 font-medium opacity-80">{label}</p>
    </Link>
  );
}
