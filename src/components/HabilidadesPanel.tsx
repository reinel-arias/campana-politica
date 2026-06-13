'use client';

import { useState } from 'react';
import { Habilidades } from '@/types';

interface Props {
  colaboradorId: number;
  initial: Habilidades;
}

const HABILIDADES: { key: keyof Habilidades; label: string; desc: string }[] = [
  { key: 'vehiculo',       label: 'Vehículo',              desc: 'Dispone de vehículo propio' },
  { key: 'perifoneo',      label: 'Perifoneo',              desc: 'Disponible para perifoneo' },
  { key: 'orador_publico', label: 'Orador en Público',     desc: 'Experiencia en presentaciones públicas' },
  { key: 'redes_sociales', label: 'Manejo Redes Sociales', desc: 'Gestiona redes sociales' },
];

export default function HabilidadesPanel({ colaboradorId, initial }: Props) {
  const [habilidades, setHabilidades] = useState<Habilidades>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const toggle = (key: keyof Habilidades) => {
    setHabilidades((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/colaboradores/${colaboradorId}/habilidades`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habilidades),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSaved(true);
    } catch {
      setError('No se pudieron guardar las habilidades');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-4">Habilidades y Recursos</h2>

      <div className="space-y-3">
        {HABILIDADES.map(({ key, label, desc }) => (
          <label
            key={key}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={habilidades[key]}
              onChange={() => toggle(key)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar Habilidades'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Guardado</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </div>
  );
}
