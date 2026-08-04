'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lider } from '@/types';

export default function LideresTable({ lideres }: { lideres: Lider[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtrados = query.trim()
    ? lideres.filter(l =>
        `${l.nombre} ${l.apellidos}`.toLowerCase().includes(query.toLowerCase())
      )
    : lideres;

  const allFilteredSelected = filtrados.length > 0 && filtrados.every(l => selected.has(l.id));

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        filtrados.forEach(l => next.delete(l.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        filtrados.forEach(l => next.add(l.id));
        return next;
      });
    }
  };

  const handleEmail = () => {
    const ids = Array.from(selected).join(',');
    router.push(`/lideres/email?ids=${ids}`);
  };

  const handleDelete = async (e: React.MouseEvent, lider: Lider) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar al líder "${lider.nombre} ${lider.apellidos}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(lider.id);
    try {
      const res = await fetch(`/api/lideres/${lider.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'No se pudo eliminar el líder'); return; }
      router.refresh();
    } catch {
      alert('Error al eliminar líder');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full max-w-xs border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {selected.size > 0 && (
          <button
            onClick={handleEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email ({selected.size})
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-3 py-3 w-px text-left">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  title="Seleccionar todos"
                />
              </th>
              <th className="text-left px-5 py-3 text-slate-600 font-semibold">Cédula</th>
              <th className="text-left px-5 py-3 text-slate-600 font-semibold">Nombre</th>
              <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden sm:table-cell">Teléfono</th>
              <th className="text-center px-5 py-3 text-slate-600 font-semibold">Colaboradores</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtrados.map((lider) => (
              <tr
                key={lider.id}
                onClick={() => router.push(`/lideres/${lider.id}`)}
                className={`cursor-pointer transition-colors ${selected.has(lider.id) ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
              >
                <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(lider.id)}
                    onChange={() => toggleSelect(lider.id)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </td>
                <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{lider.cedula}</td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-800">{lider.nombre} {lider.apellidos}</p>
                  {lider.direccion && <p className="text-xs text-slate-400 mt-0.5">{lider.direccion}</p>}
                </td>
                <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{lider.telefono}</td>
                <td className="px-5 py-3.5 text-center">
                  <Link
                    href={`/colaboradores?lider_cedula=${lider.cedula}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-xs font-bold rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {lider.total_colaboradores ?? 0}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={(e) => handleDelete(e, lider)}
                    disabled={deleting === lider.id}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 transition-colors"
                    title="Eliminar"
                  >
                    {deleting === lider.id
                      ? <span className="text-xs">...</span>
                      : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
