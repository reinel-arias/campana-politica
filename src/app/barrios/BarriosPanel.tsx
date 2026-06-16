'use client';

import { useEffect, useState } from 'react';
import { Barrio, Comuna } from '@/types';

interface Props {
  comunas: Comuna[];
  selectedComunaId: number | null;
}

export default function BarriosPanel({ comunas, selectedComunaId }: Props) {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [filtroComuna, setFiltroComuna] = useState<string>(selectedComunaId?.toString() ?? '');
  const [newNombre, setNewNombre] = useState('');
  const [newComunaId, setNewComunaId] = useState<string>(selectedComunaId?.toString() ?? '');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editComunaId, setEditComunaId] = useState('');
  const [error, setError] = useState('');

  const reload = async (comunaId?: string) => {
    const query = comunaId ? `?comuna_id=${comunaId}` : '';
    const res = await fetch(`/api/barrios${query}`);
    if (res.ok) setBarrios(await res.json());
  };

  useEffect(() => {
    const id = selectedComunaId?.toString() ?? '';
    setFiltroComuna(id);
    setNewComunaId(id);
    reload(id || undefined);
  }, [selectedComunaId]);

  const handleFiltroChange = (val: string) => {
    setFiltroComuna(val);
    reload(val || undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim() || !newComunaId) return;
    setCreating(true);
    setError('');
    const res = await fetch('/api/barrios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newNombre, comuna_id: Number(newComunaId) }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error); return; }
    setNewNombre('');
    await reload(filtroComuna || undefined);
  };

  const startEdit = (b: Barrio) => {
    setEditingId(b.id);
    setEditNombre(b.nombre);
    setEditComunaId(b.comuna_id.toString());
    setError('');
  };

  const handleUpdate = async (id: number) => {
    if (!editNombre.trim() || !editComunaId) return;
    setError('');
    const res = await fetch(`/api/barrios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: editNombre, comuna_id: Number(editComunaId) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setEditingId(null);
    await reload(filtroComuna || undefined);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar el barrio "${nombre}"?`)) return;
    setError('');
    const res = await fetch(`/api/barrios/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    await reload(filtroComuna || undefined);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Barrios</h2>
        <p className="text-xs text-slate-400 mt-0.5">{barrios.length} registrados</p>
      </div>

      {/* Crear */}
      <form onSubmit={handleCreate} className="px-5 py-3 border-b border-slate-100 flex gap-2 flex-wrap">
        <select
          value={newComunaId}
          onChange={(e) => setNewComunaId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
        >
          <option value="">Seleccionar comuna...</option>
          {comunas.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <input
          value={newNombre}
          onChange={(e) => setNewNombre(e.target.value)}
          placeholder="Nombre del nuevo barrio..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
        />
        <button
          type="submit"
          disabled={creating || !newNombre.trim() || !newComunaId}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {creating ? '...' : '+ Agregar'}
        </button>
      </form>

      {/* Filtro */}
      <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2">
        <span className="text-xs text-slate-500 whitespace-nowrap">Filtrar:</span>
        <select
          value={filtroComuna}
          onChange={(e) => handleFiltroChange(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todas las comunas</option>
          {comunas.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="px-5 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</p>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {barrios.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">
            No hay barrios{filtroComuna ? ' en esta comuna' : ' registrados'}
          </p>
        ) : barrios.map((b) => (
          <div key={b.id} className="flex items-center gap-2 px-5 py-3 hover:bg-slate-50 transition-colors group">
            {editingId === b.id ? (
              <>
                <select
                  value={editComunaId}
                  onChange={(e) => setEditComunaId(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {comunas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(b.id)}
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={() => handleUpdate(b.id)} className="text-xs text-blue-600 hover:underline whitespace-nowrap">Guardar</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">Cancelar</button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{b.nombre}</p>
                  <p className="text-xs text-slate-400">{b.comuna_nombre}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(b)}
                    className="text-xs text-slate-500 hover:text-blue-600 px-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.nombre)}
                    className="text-xs text-red-500 hover:text-red-700 px-1"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
