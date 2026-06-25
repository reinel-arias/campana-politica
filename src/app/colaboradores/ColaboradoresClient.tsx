'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Colaborador, Lider, Comuna, Barrio, PuestoVotacion } from '@/types';

interface Props {
  colaboradores: Colaborador[];
  lideres: Lider[];
  comunas: Comuna[];
  barrios: Barrio[];
  puestos: PuestoVotacion[];
  selectedLider: string;
  selectedComuna: string;
  selectedBarrio: string;
  selectedPuesto: string;
}

type HabKey = 'vehiculo' | 'perifoneo' | 'orador_publico' | 'redes_sociales';

const HABILIDADES: { key: HabKey; label: string }[] = [
  { key: 'vehiculo',       label: 'Vehículo' },
  { key: 'perifoneo',      label: 'Perifoneo' },
  { key: 'orador_publico', label: 'Orador' },
  { key: 'redes_sociales', label: 'Redes Sociales' },
];


function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function getHab(c: Colaborador, key: HabKey): boolean {
  return !!(c as unknown as Record<string, unknown>)[key];
}

export default function ColaboradoresClient({ colaboradores, lideres, comunas, barrios, puestos, selectedLider, selectedComuna, selectedBarrio, selectedPuesto }: Props) {
  const router = useRouter();
  const [liderFiltro, setLiderFiltro] = useState(selectedLider);
  const [comunaFiltro, setComunaFiltro] = useState(selectedComuna);
  const [barrioFiltro, setBarrioFiltro] = useState(selectedBarrio);
  const [puestoFiltro, setPuestoFiltro] = useState(selectedPuesto);
  const [habFiltros, setHabFiltros] = useState<Set<HabKey>>(new Set());
  const [deleting, setDeleting] = useState<number | null>(null);

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    if (liderFiltro) params.set('lider_cedula', liderFiltro);
    if (comunaFiltro) params.set('comuna_id', comunaFiltro);
    if (barrioFiltro) params.set('barrio_id', barrioFiltro);
    if (puestoFiltro) params.set('puesto_id', puestoFiltro);
    for (const [key, val] of Object.entries(updates)) {
      if (val) params.set(key, val); else params.delete(key);
    }
    router.push(`/colaboradores${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleLiderFiltro = (val: string) => {
    setLiderFiltro(val);
    navigate({ lider_cedula: val });
  };

  const handleComunaFiltro = (val: string) => {
    setComunaFiltro(val);
    setBarrioFiltro('');
    navigate({ comuna_id: val, barrio_id: '' });
  };

  const handleBarrioFiltro = (val: string) => {
    setBarrioFiltro(val);
    navigate({ barrio_id: val });
  };

  const handlePuestoFiltro = (val: string) => {
    setPuestoFiltro(val);
    navigate({ puesto_id: val });
  };

  const toggleHab = (key: HabKey) => {
    setHabFiltros((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const limpiarFiltros = () => {
    setHabFiltros(new Set());
    setLiderFiltro('');
    setComunaFiltro('');
    setBarrioFiltro('');
    setPuestoFiltro('');
    router.push('/colaboradores');
  };

  const barriosDeFiltro = comunaFiltro
    ? barrios.filter((b) => b.comuna_id.toString() === comunaFiltro)
    : barrios;

  const hayFiltros = liderFiltro || comunaFiltro || barrioFiltro || puestoFiltro || habFiltros.size > 0;

  const filtrados = habFiltros.size === 0
    ? colaboradores
    : colaboradores.filter((c) =>
        Array.from(habFiltros).every((key) => getHab(c, key))
      );

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
      {/* Barra de filtros */}
      <div className="mb-5 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por líder */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Líder</label>
            <select
              value={liderFiltro}
              onChange={(e) => handleLiderFiltro(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[190px]"
            >
              <option value="">Todos</option>
              {lideres.map((l) => (
                <option key={l.cedula} value={l.cedula}>
                  {l.apellidos}, {l.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          {/* Filtro por comuna */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Comuna</label>
            <select
              value={comunaFiltro}
              onChange={(e) => handleComunaFiltro(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
            >
              <option value="">Todas</option>
              {comunas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro por barrio */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Barrio</label>
            <select
              value={barrioFiltro}
              onChange={(e) => handleBarrioFiltro(e.target.value)}
              disabled={barriosDeFiltro.length === 0}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px] disabled:opacity-50"
            >
              <option value="">Todos</option>
              {barriosDeFiltro.map((b) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          {/* Filtro por puesto */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Puesto</label>
            <select
              value={puestoFiltro}
              onChange={(e) => handlePuestoFiltro(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
            >
              <option value="">Todos</option>
              {puestos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila de habilidades + limpiar */}
        <div className="border-t border-slate-100 pt-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Habilidades</span>
          {HABILIDADES.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer select-none transition-colors ${
                habFiltros.has(key)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={habFiltros.has(key)}
                onChange={() => toggleHab(key)}
              />
              {label}
            </label>
          ))}
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 underline whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteo */}
      {habFiltros.size > 0 && (
        <p className="text-xs text-slate-500 mb-3">
          Mostrando {filtrados.length} de {colaboradores.length} colaboradores con todas las habilidades seleccionadas
        </p>
      )}

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2">No hay colaboradores con los filtros aplicados</p>
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
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden lg:table-cell">Edad</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden lg:table-cell">Barrio</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden xl:table-cell">Puesto Votación</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/colaboradores/${c.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{c.cedula}</td>
                  <td className="px-5 py-3.5">
                    <p className={`font-medium ${c.sexo === 'M' ? 'text-blue-700' : 'text-rose-600'}`}>
                      {c.apellidos}, {c.nombre}
                    </p>
                    {c.telefono && <p className="text-xs text-slate-400 mt-0.5">{c.telefono}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">
                    {calcularEdad(c.fecha_nacimiento)} años
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">
                    {c.barrio_nombre ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden xl:table-cell">
                    {c.puesto_nombre
                      ? <span>{c.zona_codigo}-{c.puesto_codigo} {c.puesto_nombre}</span>
                      : '—'}
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
    </>
  );
}
