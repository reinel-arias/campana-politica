'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ColaboradorForm from '@/components/ColaboradorForm';
import { Lider, Comuna } from '@/types';

type FormValues = {
  cedula: string; nombre: string; apellidos: string;
  sexo: 'M' | 'F'; fecha_nacimiento: string;
  direccion: string; telefono: string; email: string;
  lider_cedula: string; barrio_id: string;
};

type HabKey = 'vehiculo' | 'perifoneo' | 'orador_publico' | 'redes_sociales';

const HABILIDADES: { key: HabKey; label: string }[] = [
  { key: 'vehiculo',       label: 'Vehículo propio' },
  { key: 'perifoneo',      label: 'Perifoneo' },
  { key: 'orador_publico', label: 'Orador público' },
  { key: 'redes_sociales', label: 'Redes sociales' },
];

const HAB_INICIAL: Record<HabKey, boolean> = {
  vehiculo: false, perifoneo: false, orador_publico: false, redes_sociales: false,
};

interface Props {
  lideres: Lider[];
  comunas: Comuna[];
}

export default function CapturaClient({ lideres, comunas }: Props) {
  const router = useRouter();
  const [habilidades, setHabilidades] = useState<Record<HabKey, boolean>>(HAB_INICIAL);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formKey, setFormKey] = useState(0);

  const toggleHab = (key: HabKey) =>
    setHabilidades((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (data: FormValues) => {
    setError('');
    setSuccess(false);

    // 1. Crear colaborador
    const res = await fetch('/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        barrio_id: data.barrio_id ? Number(data.barrio_id) : null,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Error al guardar el colaborador');
      return;
    }

    // 2. Guardar habilidades para el nuevo colaborador
    await fetch(`/api/colaboradores/${result.id}/habilidades`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habilidades),
    });

    // 3. Reset
    setSuccess(true);
    setHabilidades(HAB_INICIAL);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await fetch('/api/captura/auth/logout', { method: 'POST' });
    router.push('/captura/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabecera */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Campaña Política</h1>
          <p className="text-slate-400 text-xs mt-0.5">Captura de Colaboradores</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </header>

      {/* Contenido */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Mensaje de éxito */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-green-800 font-medium text-sm">Colaborador guardado correctamente</p>
              <p className="text-green-600 text-xs mt-0.5">El formulario está listo para el siguiente registro.</p>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Datos personales */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Datos del Colaborador</h2>
          <ColaboradorForm
            key={formKey}
            lideres={lideres}
            comunas={comunas}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Habilidades */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Habilidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HABILIDADES.map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${
                  habilidades[key]
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={habilidades[key]}
                  onChange={() => toggleHab(key)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Las habilidades se guardan automáticamente al hacer clic en <strong>Guardar Colaborador</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
