'use client';

import { useState } from 'react';
import { Comuna } from '@/types';

interface Props {
  initialComunas: Comuna[];
  onComunaSelect: (comunaId: number | null) => void;
  selectedComunaId: number | null;
}

export default function ComunasPanel({ initialComunas, onComunaSelect, selectedComunaId }: Props) {
  const [comunas, setComunas] = useState<Comuna[]>(initialComunas);
  const [newNombre, setNewNombre] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [error, setError] = useState('');

  const reload = async () => {
    const res = await fetch('/api/comunas');
    if (res.ok) setComunas(await res.json());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    setCreating(true);
    setError('');
    const res = await fetch('/api/comunas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newNombre }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error); return; }
    setNewNombre('');
    await reload();
  };

  const startEdit = (c: Comuna) => {
    setEditingId(c.id);
    setEditNombre(c.nombre);
    setError('');
  };

  const handleUpdate = async (id: number) => {
    if (!editNombre.trim()) return;
    setError('');
    const res = await fetch(`/api/comunas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: editNombre }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setEditingId(null);
    await reload();
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar la comuna "${nombre}"?`)) return;
    setError('');
    const res = await fetch(`/api/comunas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    if (selectedComunaId === id) onComunaSelect(null);
    await reload();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Comunas</h2>
        <p className="text-xs text-slate-400 mt-0.5">{comunas.length} registradas</p>
      </div>

      {/* Crear */}
      <form onSubmit={handleCreate} className="px-5 py-3 border-b border-slate-100 flex gap-2">
        <input
          value={newNombre}
          onChange={(e) => setNewNombre(e.target.value)}
          placeholder="Nombre de nueva comuna..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={creating || !newNombre.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {creating ? '...' : '+ Agregar'}
        </button>
      </form>

      {error && (
        <p className="px-5 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</p>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {comunas.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No hay comunas registradas</p>
        ) : comunas.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-2 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors group ${
              selectedComunaId === c.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
            onClick={() => onComunaSelect(selectedComunaId === c.id ? null : c.id)}
          >
            {editingId === c.id ? (
              <input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(c.id)}
                className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <span className="flex-1 text-sm font-medium text-slate-700">{c.nombre}</span>
            )}

            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {c.total_barrios ?? 0}
            </span>

            {editingId === c.id ? (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleUpdate(c.id)} className="text-xs text-blue-600 hover:underline">Guardar</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">Cancelar</button>
              </div>
            ) : (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                  className="text-xs text-slate-500 hover:text-blue-600 px-1"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.nombre); }}
                  className="text-xs text-red-500 hover:text-red-700 px-1"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
