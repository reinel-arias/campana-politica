'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Colaborador, Lider } from '@/types';

interface Props {
  colaboradores: Colaborador[];
  lideres: Lider[];
  selectedLider: string;
}

const SEXO = { M: 'Masculino', F: 'Femenino' };

function formatFecha(fecha: string) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ColaboradoresClient({ colaboradores, lideres, selectedLider }: Props) {
  const router = useRouter();
  const [liderFiltro, setLiderFiltro] = useState(selectedLider);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleFiltro = (val: string) => {
    setLiderFiltro(val);
    const params = val ? `?lider_cedula=${val}` : '';
    router.push(`/colaboradores${params}`);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar al colaborador "${nombre}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/colaboradores/${id}`, { method: 'DELETE' });
    setDeleting(null);
    if (res.ok) router.refresh();
    else alert('No se pudo eliminar el colaborador');
  };

  return (
    <>
      {/* Filter bar */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Filtrar por Líder:</label>
        <select
          value={liderFiltro}
          onChange={(e) => handleFiltro(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[220px]"
        >
          <option value="">Todos los líderes</option>
          {lideres.map((l) => (
            <option key={l.cedula} value={l.cedula}>
              {l.apellidos}, {l.nombre}
            </option>
          ))}
        </select>
        {liderFiltro && (
          <button
            onClick={() => handleFiltro('')}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {colaboradores.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2">No hay colaboradores{liderFiltro ? ' para este líder' : ''}</p>
          <Link href="/colaboradores/nuevo" className="text-blue-600 hover:underline text-sm">
            Agregar colaborador
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-slate-600 font-semibold">Cédula</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold">Nombre</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden md:table-cell">Sexo</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden lg:table-cell">Nacimiento</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden sm:table-cell">Líder</th>
                <th className="text-center px-5 py-3 text-slate-600 font-semibold hidden lg:table-cell">Habilidades</th>
                <th className="text-right px-5 py-3 text-slate-600 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colaboradores.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{c.cedula}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{c.apellidos}, {c.nombre}</p>
                    {c.telefono && <p className="text-xs text-slate-400 mt-0.5">{c.telefono}</p>}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      c.sexo === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                    }`}>
                      {SEXO[c.sexo]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{formatFecha(c.fecha_nacimiento)}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <p className="text-slate-700 text-xs">{c.lider_apellidos}, {c.lider_nombre}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex justify-center gap-1 flex-wrap">
                      {c.habilidades?.vehiculo       && <HabBadge label="Vehículo" />}
                      {c.habilidades?.perifoneo      && <HabBadge label="Perifoneo" />}
                      {c.habilidades?.orador_publico && <HabBadge label="Orador" />}
                      {c.habilidades?.redes_sociales && <HabBadge label="Redes" />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/colaboradores/${c.id}`}
                        className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                      >
                        Ver / Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, `${c.nombre} ${c.apellidos}`)}
                        disabled={deleting === c.id}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {deleting === c.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function HabBadge({ label }: { label: string }) {
  return (
    <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
      {label}
    </span>
  );
}
