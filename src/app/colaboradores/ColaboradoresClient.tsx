'use client';

import { useState, useRef, useEffect } from 'react';
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


function calcularEdad(fechaNacimiento: string | null): number {
  if (!fechaNacimiento) return 0;
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

function SearchableSelect({ items, value, onChange, placeholder = 'Todos...', minWidth = '180px' }: {
  items: { id: number; nombre: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minWidth?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find((p) => p.id.toString() === value);
  const displayValue = open ? query : (selected?.nombre ?? '');

  const filtered = query.trim()
    ? items.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative" style={{ minWidth }}>
      <input
        value={displayValue}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(''); }}
        onFocus={() => { setOpen(true); setQuery(selected?.nombre ?? ''); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-6"
      />
      {value && !open && (
        <button
          onClick={() => { onChange(''); setQuery(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
        >×</button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          <div
            onMouseDown={() => { onChange(''); setOpen(false); setQuery(''); }}
            className="px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer"
          >Todos</div>
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
          ) : filtered.map((p) => (
            <div
              key={p.id}
              onMouseDown={() => { onChange(p.id.toString()); setOpen(false); setQuery(''); }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${p.id.toString() === value ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-700'}`}
            >{p.nombre}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ColaboradoresClient({ colaboradores, lideres, comunas, barrios, puestos, selectedLider, selectedComuna, selectedBarrio, selectedPuesto }: Props) {
  const router = useRouter();
  const [liderFiltro, setLiderFiltro] = useState(selectedLider);
  const [comunaFiltro, setComunaFiltro] = useState(selectedComuna);
  const [barrioFiltro, setBarrioFiltro] = useState(selectedBarrio);
  const [puestoFiltro, setPuestoFiltro] = useState(selectedPuesto);
  const [habFiltros, setHabFiltros] = useState<Set<HabKey>>(new Set());
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
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
    setNombreFiltro('');
    setLiderFiltro('');
    setComunaFiltro('');
    setBarrioFiltro('');
    setPuestoFiltro('');
    router.push('/colaboradores');
  };

  const barriosDeFiltro = comunaFiltro
    ? barrios.filter((b) => b.comuna_id.toString() === comunaFiltro)
    : barrios;

  const hayFiltros = liderFiltro || comunaFiltro || barrioFiltro || puestoFiltro || habFiltros.size > 0 || nombreFiltro;

  const filtrados = colaboradores.filter((c) => {
    if (nombreFiltro.trim() && !`${c.nombre} ${c.apellidos}`.toLowerCase().includes(nombreFiltro.toLowerCase())) return false;
    if (habFiltros.size > 0 && !Array.from(habFiltros).every((key) => getHab(c, key))) return false;
    return true;
  });

  const allFilteredSelected = filtrados.length > 0 && filtrados.every(c => selected.has(c.id));

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => { const next = new Set(prev); filtrados.forEach(c => next.delete(c.id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); filtrados.forEach(c => next.add(c.id)); return next; });
    }
  };

  const handleEmail = () => {
    const ids = Array.from(selected).join(',');
    router.push(`/colaboradores/email?ids=${ids}`);
  };

  const handleSms = () => {
    const ids = Array.from(selected).join(',');
    router.push(`/colaboradores/sms?ids=${ids}`);
  };

  const handleExportar = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Colaboradores');
    const siNo = (v: boolean) => (v ? 'Sí' : 'No');

    ws.columns = [
      { header: 'Cédula',           key: 'cedula',      width: 15 },
      { header: 'Nombres',          key: 'nombre',      width: 20 },
      { header: 'Apellidos',        key: 'apellidos',   width: 22 },
      { header: 'Sexo',             key: 'sexo',        width: 11 },
      { header: 'Fecha Nacimiento', key: 'fecha',       width: 17 },
      { header: 'Edad',             key: 'edad',        width: 7 },
      { header: 'Teléfono',         key: 'telefono',    width: 14 },
      { header: 'Email',            key: 'email',       width: 28 },
      { header: 'Dirección',        key: 'direccion',   width: 30 },
      { header: 'Comuna',           key: 'comuna',      width: 20 },
      { header: 'Barrio',           key: 'barrio',      width: 24 },
      { header: 'Zona',             key: 'zona',        width: 9 },
      { header: 'Puesto Votación',  key: 'puesto',      width: 32 },
      { header: 'Líder',            key: 'lider',       width: 26 },
      ...HABILIDADES.map(({ key, label }) => ({ header: label, key, width: 12 })),
    ];

    filtrados.forEach((c) => {
      ws.addRow({
        cedula:    c.cedula,
        nombre:    c.nombre,
        apellidos: c.apellidos,
        sexo:      c.sexo === 'M' ? 'Masculino' : 'Femenino',
        fecha:     c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        edad:      calcularEdad(c.fecha_nacimiento),
        telefono:  c.telefono,
        email:     c.email,
        direccion: c.direccion,
        comuna:    c.comuna_nombre ?? '',
        barrio:    c.barrio_nombre ?? '',
        zona:      c.zona_codigo ? `Zona ${c.zona_codigo}` : '',
        puesto:    c.puesto_nombre ?? '',
        lider:     `${c.lider_nombre ?? ''} ${c.lider_apellidos ?? ''}`.trim(),
        ...Object.fromEntries(HABILIDADES.map(({ key }) => [key, siNo(getHab(c, key))])),
      });
    });
    ws.getRow(1).font = { bold: true };

    const buffer = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `colaboradores_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Barra de filtros */}
      <div className="mb-5 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por nombre */}
          <input
            type="text"
            value={nombreFiltro}
            onChange={e => setNombreFiltro(e.target.value)}
            placeholder="Buscar por nombre..."
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          />

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
                  {l.nombre} {l.apellidos}
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
            <SearchableSelect
              items={barriosDeFiltro}
              value={barrioFiltro}
              onChange={handleBarrioFiltro}
              placeholder="Todos los barrios..."
              minWidth="180px"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          {/* Filtro por puesto */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Puesto</label>
            <SearchableSelect
              items={puestos}
              value={puestoFiltro}
              onChange={handlePuestoFiltro}
              placeholder="Todos los puestos..."
              minWidth="220px"
            />
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
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleExportar}
              disabled={filtrados.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar Excel
            </button>
            {selected.size > 0 && (
              <>
                <button
                  onClick={handleEmail}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email ({selected.size})
                </button>
                <button
                  onClick={handleSms}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  SMS ({selected.size})
                </button>
              </>
            )}
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="text-xs text-slate-400 hover:text-slate-600 underline whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}
          </div>
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
                <th className="pl-4 pr-1 py-3 w-px whitespace-nowrap text-left">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    title="Seleccionar todos"
                  />
                </th>
                <th className="text-left pl-2 pr-5 py-3 text-slate-600 font-semibold w-px whitespace-nowrap">Nombre</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold w-px whitespace-nowrap hidden md:table-cell">Edad / Barrio</th>
                <th className="text-left px-5 py-3 text-slate-600 font-semibold hidden lg:table-cell">Líder</th>
                <th className="px-5 py-3 w-px"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/colaboradores/${c.id}`)}
                  className={`cursor-pointer transition-colors ${selected.has(c.id) ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
                >
                  <td className="pl-4 pr-1 py-3.5 w-px whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="pl-2 pr-5 py-3.5 whitespace-nowrap">
                    <p className={`font-medium ${c.sexo === 'M' ? 'text-blue-700' : 'text-rose-600'}`}>
                      {c.apellidos}, {c.nombre}
                    </p>
                    {c.telefono && <p className="text-xs text-slate-400 mt-0.5">{c.telefono}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap hidden md:table-cell">
                    <p>{calcularEdad(c.fecha_nacimiento)} años</p>
                    {c.barrio_nombre && <p className="text-slate-400 mt-0.5">{c.barrio_nombre}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">
                    {c.lider_nombre
                      ? <span>{c.lider_nombre} {c.lider_apellidos}</span>
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
