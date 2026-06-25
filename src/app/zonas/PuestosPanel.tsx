'use client';

import { useEffect, useState } from 'react';
import { PuestoVotacion, Zona } from '@/types';

interface Props {
  zonas: Zona[];
  selectedZonaId: number | null;
}

const EMPTY_FORM = { codigo: '', nombre: '', direccion: '', num_mesas: '' };

export default function PuestosPanel({ zonas, selectedZonaId }: Props) {
  const [puestos, setPuestos] = useState<PuestoVotacion[]>([]);
  const [filtroZona, setFiltroZona] = useState<string>(selectedZonaId?.toString() ?? '');
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editZonaId, setEditZonaId] = useState('');
  const [error, setError] = useState('');

  const reload = async (zonaId?: string) => {
    const q = zonaId ? `?zona_id=${zonaId}` : '';
    const res = await fetch(`/api/puestos${q}`);
    if (res.ok) setPuestos(await res.json());
  };

  useEffect(() => {
    const id = selectedZonaId?.toString() ?? '';
    setFiltroZona(id);
    reload(id || undefined);
  }, [selectedZonaId]);

  const handleFiltroChange = (val: string) => {
    setFiltroZona(val);
    reload(val || undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZonaId) { setError('Selecciona una zona'); return; }
    setCreating(true);
    setError('');
    const res = await fetch('/api/puestos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zona_id: Number(newZonaId),
        codigo: newForm.codigo,
        nombre: newForm.nombre,
        direccion: newForm.direccion,
        num_mesas: newForm.num_mesas,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error); return; }
    setNewForm(EMPTY_FORM);
    await reload(filtroZona || undefined);
  };

  const startEdit = (p: PuestoVotacion) => {
    setEditingId(p.id);
    setEditForm({ codigo: p.codigo, nombre: p.nombre, direccion: p.direccion, num_mesas: p.num_mesas.toString() });
    setEditZonaId(p.zona_id.toString());
    setError('');
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.codigo.trim() || !editForm.nombre.trim()) return;
    setError('');
    const res = await fetch(`/api/puestos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zona_id: Number(editZonaId),
        codigo: editForm.codigo,
        nombre: editForm.nombre,
        direccion: editForm.direccion,
        num_mesas: editForm.num_mesas,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setEditingId(null);
    await reload(filtroZona || undefined);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar el puesto "${nombre}"?`)) return;
    setError('');
    const res = await fetch(`/api/puestos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    await reload(filtroZona || undefined);
  };

  const [newZonaId, setNewZonaId] = useState<string>(selectedZonaId?.toString() ?? '');

  useEffect(() => {
    setNewZonaId(selectedZonaId?.toString() ?? '');
  }, [selectedZonaId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Puestos de Votación</h2>
        <p className="text-xs text-slate-400 mt-0.5">{puestos.length} registrados</p>
      </div>

      {/* Crear */}
      <form onSubmit={handleCreate} className="px-5 py-3 border-b border-slate-100 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <select
            value={newZonaId}
            onChange={e => setNewZonaId(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Zona…</option>
            {zonas.map(z => <option key={z.id} value={z.id}>Zona {z.codigo}</option>)}
          </select>
          <input
            value={newForm.codigo}
            onChange={e => setNewForm(f => ({ ...f, codigo: e.target.value }))}
            placeholder="00"
            maxLength={2}
            className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newForm.nombre}
            onChange={e => setNewForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre del puesto..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          />
          <input
            value={newForm.num_mesas}
            onChange={e => setNewForm(f => ({ ...f, num_mesas: e.target.value }))}
            placeholder="Mesas"
            type="number"
            min={0}
            className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={newForm.direccion}
            onChange={e => setNewForm(f => ({ ...f, direccion: e.target.value }))}
            placeholder="Dirección..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={creating || !newZonaId || !newForm.codigo.trim() || !newForm.nombre.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {creating ? '...' : '+ Agregar'}
          </button>
        </div>
      </form>

      {/* Filtro */}
      <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2">
        <span className="text-xs text-slate-500 whitespace-nowrap">Filtrar:</span>
        <select
          value={filtroZona}
          onChange={e => handleFiltroChange(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todas las zonas</option>
          {zonas.map(z => <option key={z.id} value={z.id}>Zona {z.codigo}</option>)}
        </select>
      </div>

      {error && (
        <p className="px-5 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {puestos.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">
            No hay puestos{filtroZona ? ' en esta zona' : ' registrados'}
          </p>
        ) : puestos.map(p => (
          <div key={p.id} className="flex items-start gap-2 px-5 py-3 hover:bg-slate-50 transition-colors group">
            {editingId === p.id ? (
              <div className="flex-1 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={editZonaId}
                    onChange={e => setEditZonaId(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {zonas.map(z => <option key={z.id} value={z.id}>Zona {z.codigo}</option>)}
                  </select>
                  <input
                    value={editForm.codigo}
                    onChange={e => setEditForm(f => ({ ...f, codigo: e.target.value }))}
                    maxLength={2}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <input
                    value={editForm.num_mesas}
                    onChange={e => setEditForm(f => ({ ...f, num_mesas: e.target.value }))}
                    type="number"
                    min={0}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Mesas"
                  />
                </div>
                <input
                  value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleUpdate(p.id)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  value={editForm.direccion}
                  onChange={e => setEditForm(f => ({ ...f, direccion: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Dirección"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(p.id)} className="text-xs text-blue-600 hover:underline">Guardar</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    <span className="text-slate-400 font-mono mr-1">{p.zona_codigo}-{p.codigo}</span>
                    {p.nombre}
                  </p>
                  {p.direccion && <p className="text-xs text-slate-400 mt-0.5 truncate">{p.direccion}</p>}
                  <p className="text-xs text-slate-400">{p.num_mesas} mesas</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => startEdit(p)} className="text-xs text-slate-500 hover:text-blue-600 px-1">Editar</button>
                  <button onClick={() => handleDelete(p.id, p.nombre)} className="text-xs text-red-500 hover:text-red-700 px-1">Eliminar</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
