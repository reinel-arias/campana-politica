'use client';

import { useState } from 'react';
import { Zona } from '@/types';

interface Props {
  zonas: Zona[];
  selectedZonaId: number | null;
  onZonaSelect: (id: number | null) => void;
  onZonasChange: () => void;
}

export default function ZonasPanel({ zonas, selectedZonaId, onZonaSelect, onZonasChange }: Props) {
  const [newCodigo, setNewCodigo] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCodigo, setEditCodigo] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo.trim()) return;
    setCreating(true);
    setError('');
    const res = await fetch('/api/zonas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: newCodigo }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error); return; }
    setNewCodigo('');
    onZonasChange();
  };

  const startEdit = (z: Zona) => {
    setEditingId(z.id);
    setEditCodigo(z.codigo);
    setError('');
  };

  const handleUpdate = async (id: number) => {
    if (!editCodigo.trim()) return;
    setError('');
    const res = await fetch(`/api/zonas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: editCodigo }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setEditingId(null);
    onZonasChange();
  };

  const handleDelete = async (id: number, codigo: string) => {
    if (!confirm(`¿Eliminar la zona "${codigo}" y todos sus puestos?`)) return;
    setError('');
    const res = await fetch(`/api/zonas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    if (selectedZonaId === id) onZonaSelect(null);
    onZonasChange();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Zonas</h2>
        <p className="text-xs text-slate-400 mt-0.5">{zonas.length} registradas</p>
      </div>

      <form onSubmit={handleCreate} className="px-5 py-3 border-b border-slate-100 flex gap-2">
        <input
          value={newCodigo}
          onChange={e => setNewCodigo(e.target.value)}
          placeholder="Código (ej: 04)..."
          maxLength={2}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={creating || !newCodigo.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {creating ? '...' : '+ Agregar'}
        </button>
      </form>

      {error && (
        <p className="px-5 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {zonas.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No hay zonas registradas</p>
        ) : zonas.map(z => (
          <div
            key={z.id}
            onClick={() => editingId !== z.id && onZonaSelect(selectedZonaId === z.id ? null : z.id)}
            className={`flex items-center gap-2 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors group ${
              selectedZonaId === z.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
          >
            {editingId === z.id ? (
              <>
                <input
                  value={editCodigo}
                  onChange={e => setEditCodigo(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.key === 'Enter' && handleUpdate(z.id)}
                  maxLength={2}
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-1 ml-auto" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleUpdate(z.id)} className="text-xs text-blue-600 hover:underline">Guardar</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-slate-700">Zona {z.codigo}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {z.total_puestos ?? 0} puestos
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startEdit(z)} className="text-xs text-slate-500 hover:text-blue-600 px-1">Editar</button>
                  <button onClick={() => handleDelete(z.id, z.codigo)} className="text-xs text-red-500 hover:text-red-700 px-1">Eliminar</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
