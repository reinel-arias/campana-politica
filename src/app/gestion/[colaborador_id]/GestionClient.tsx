'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Colaborador, Gestion } from '@/types';

interface Props {
  colaborador: Colaborador;
  initialGestiones: Gestion[];
}

const today = new Date().toISOString().slice(0, 10);

function rowColor(g: Gestion): string {
  if (g.gestionado) return 'bg-green-50 border-l-4 border-l-green-400';
  if (g.fecha_limite < today) return 'bg-red-50 border-l-4 border-l-red-400';
  return 'bg-amber-50 border-l-4 border-l-amber-400';
}

function diasRestantes(fechaLimite: string): string {
  const diff = Math.ceil((new Date(fechaLimite).getTime() - new Date(today).getTime()) / 86400000);
  if (diff === 0) return 'hoy';
  if (diff > 0) return `en ${diff}d`;
  return `${Math.abs(diff)}d vencido`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function GestionClient({ colaborador, initialGestiones }: Props) {
  const [gestiones, setGestiones] = useState<Gestion[]>(initialGestiones);
  const [showForm, setShowForm] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const total = gestiones.length;
  const pendientes = gestiones.filter(g => !g.gestionado).length;
  const vencidas = gestiones.filter(g => !g.gestionado && g.fecha_limite < today).length;
  const ejecutadas = gestiones.filter(g => g.gestionado).length;

  async function toggleGestionado(g: Gestion) {
    const newVal = !g.gestionado;
    const res = await fetch(`/api/gestiones/${g.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gestionado: newVal }),
    });
    if (!res.ok) return;
    const { fecha_ejecucion } = await res.json();
    setGestiones(prev =>
      prev.map(item =>
        item.id === g.id ? { ...item, gestionado: newVal, fecha_ejecucion } : item
      )
    );
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta gestión?')) return;
    const res = await fetch(`/api/gestiones/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setGestiones(prev => prev.filter(g => g.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim() || !fechaLimite) {
      setError('Descripción y fecha límite son requeridos.');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/gestiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colaborador_id: colaborador.id, descripcion: descripcion.trim(), fecha_limite: fechaLimite }),
    });
    if (!res.ok) {
      setError('Error al guardar. Intente de nuevo.');
      setSaving(false);
      return;
    }
    const { id } = await res.json();
    const nueva: Gestion = {
      id,
      colaborador_id: colaborador.id,
      descripcion: descripcion.trim(),
      fecha_limite: fechaLimite,
      gestionado: false,
      fecha_ejecucion: null,
    };
    setGestiones(prev => [...prev, nueva].sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite)));
    setDescripcion('');
    setFechaLimite('');
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/gestion" className="text-blue-600 hover:underline text-sm">← Gestión</Link>
      </div>

      {/* Tarjeta del colaborador */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-xl font-bold text-slate-800">
          {colaborador.apellidos}, {colaborador.nombre}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-slate-600">
          <div><span className="font-medium">Cédula:</span> {colaborador.cedula}</div>
          <div><span className="font-medium">Teléfono:</span> {colaborador.telefono || '—'}</div>
          <div><span className="font-medium">Barrio:</span> {colaborador.barrio_nombre ?? '—'}</div>
          {colaborador.lider_nombre && (
            <div className="col-span-2 sm:col-span-3">
              <span className="font-medium">Líder:</span> {colaborador.lider_apellidos}, {colaborador.lider_nombre}
            </div>
          )}
        </div>
        {/* Mini stats */}
        <div className="flex gap-4 pt-2 border-t border-slate-100 text-sm">
          <span className="text-slate-500">Total: <strong>{total}</strong></span>
          <span className="text-amber-600">Pendientes: <strong>{pendientes}</strong></span>
          <span className="text-red-600">Vencidas: <strong>{vencidas}</strong></span>
          <span className="text-green-600">Ejecutadas: <strong>{ejecutadas}</strong></span>
        </div>
      </div>

      {/* Formulario nueva gestión */}
      <div>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nueva Gestión
          </button>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-700">Nueva gestión</h3>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <input
                type="text"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                maxLength={255}
                placeholder="Describe el favor o gestión..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
              <input
                type="date"
                value={fechaLimite}
                onChange={e => setFechaLimite(e.target.value)}
                min={today}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lista de gestiones */}
      {gestiones.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p>No hay gestiones registradas para este colaborador.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gestiones.map(g => (
            <div key={g.id} className={`rounded-xl p-4 flex items-start gap-4 ${rowColor(g)}`}>
              <input
                type="checkbox"
                checked={g.gestionado}
                onChange={() => toggleGestionado(g)}
                className="mt-1 w-4 h-4 rounded cursor-pointer accent-green-600"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${g.gestionado ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {g.descripcion}
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Fecha límite: {formatDate(g.fecha_limite)}</span>
                  {!g.gestionado && (
                    <span className={g.fecha_limite < today ? 'text-red-600 font-semibold' : 'text-amber-700'}>
                      {diasRestantes(g.fecha_limite)}
                    </span>
                  )}
                  {g.gestionado && g.fecha_ejecucion && (
                    <span className="text-green-700">Ejecutado: {formatDate(g.fecha_ejecucion)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(g.id)}
                className="text-slate-400 hover:text-red-500 transition-colors text-sm px-2 py-1 shrink-0"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
