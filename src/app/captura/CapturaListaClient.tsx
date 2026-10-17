'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CapturaHeader from './CapturaHeader';

export interface ColaboradorFila {
  id: number;
  nombre: string;
  apellidos: string;
  sexo: 'M' | 'F';
  telefono: string;
  edad: number;
  barrio_nombre: string | null;
  puesto: string | null;
}

interface Props {
  nombreLider: string;
  colaboradores: ColaboradorFila[];
}

export default function CapturaListaClient({ nombreLider, colaboradores }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar al colaborador "${nombre}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/colaboradores/${id}`, { method: 'DELETE' });
    setDeleting(null);
    if (res.ok) router.refresh();
    else alert('No se pudo eliminar el colaborador');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CapturaHeader nombreLider={nombreLider} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Mis Colaboradores</h2>
            <p className="text-slate-500 text-sm mt-1">{colaboradores.length} colaboradores</p>
          </div>
          <Link
            href="/captura/nuevo"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Agregar colaborador
          </Link>
        </div>

        {colaboradores.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            <p className="text-lg mb-2">Aún no tienes colaboradores registrados</p>
            <Link href="/captura/nuevo" className="text-blue-600 hover:underline text-sm">
              Agregar el primero
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-slate-600 font-semibold">Nombre</th>
                  <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden sm:table-cell">Edad / Barrio</th>
                  <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden md:table-cell">Puesto Votación</th>
                  <th className="px-5 py-3 w-px"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colaboradores.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/captura/${c.id}`)}
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                  >
                    <td className="px-5 py-3.5">
                      <p className={`font-medium ${c.sexo === 'M' ? 'text-blue-700' : 'text-rose-600'}`}>
                        {c.apellidos}, {c.nombre}
                      </p>
                      {c.telefono && <p className="text-xs text-slate-400 mt-0.5">{c.telefono}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs hidden sm:table-cell">
                      <p>{c.edad} años</p>
                      {c.barrio_nombre && <p className="text-slate-400 mt-0.5">{c.barrio_nombre}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs hidden md:table-cell">
                      {c.puesto ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id, `${c.nombre} ${c.apellidos}`); }}
                        disabled={deleting === c.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 transition-colors"
                        title="Eliminar"
                      >
                        {deleting === c.id
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
        )}
      </div>
    </div>
  );
}
