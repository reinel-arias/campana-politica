'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GestionResumen, Colaborador } from '@/types';

interface Props {
  resumen: GestionResumen[];
  colaboradores: Pick<Colaborador, 'id' | 'nombre' | 'apellidos' | 'cedula'>[];
  totalPendientes: number;
  totalVencidas: number;
}

export default function GestionPageClient({ resumen, colaboradores, totalPendientes, totalVencidas }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return colaboradores
      .filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.apellidos.toLowerCase().includes(q) ||
        c.cedula.includes(q)
      )
      .slice(0, 8);
  }, [search, colaboradores]);

  function goToColaborador(id: number) {
    router.push(`/gestion/${id}`);
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Gestión de Favores</h1>

      {/* Buscador */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Buscar colaborador para agregar o ver gestiones
        </label>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Nombre, apellidos o cédula..."
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={() => goToColaborador(c.id)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex justify-between"
                >
                  <span className="font-medium">{c.apellidos}, {c.nombre}</span>
                  <span className="text-slate-400">{c.cedula}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-700 text-sm font-medium">Total pendientes</p>
          <p className="text-3xl font-bold text-amber-800 mt-1">{totalPendientes}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-medium">Vencidas</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{totalVencidas}</p>
        </div>
      </div>

      {/* Tabla de colaboradores con gestiones */}
      {resumen.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg">No hay gestiones registradas todavía.</p>
          <p className="text-sm mt-1">Usa el buscador de arriba para ir al perfil de un colaborador y agregar la primera gestión.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Colaborador</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Barrio</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Pendientes</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Vencidas</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Próxima fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resumen.map(r => (
                <tr
                  key={r.colaborador_id}
                  onClick={() => goToColaborador(r.colaborador_id)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {r.colaborador_apellidos}, {r.colaborador_nombre}
                    <span className="block text-xs text-slate-400 font-normal">{r.colaborador_cedula}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.barrio_nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{r.total}</td>
                  <td className="px-4 py-3 text-center">
                    {Number(r.pendientes) > 0
                      ? <span className="inline-block bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs font-semibold">{r.pendientes}</span>
                      : <span className="text-slate-400">0</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    {Number(r.vencidas) > 0
                      ? <span className="inline-block bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-semibold">{r.vencidas}</span>
                      : <span className="text-slate-400">0</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(r.proxima_fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
