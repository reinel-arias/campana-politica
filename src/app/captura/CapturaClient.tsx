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

interface Props {
  lideres: Lider[];
  comunas: Comuna[];
}

export default function CapturaClient({ lideres, comunas }: Props) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formKey, setFormKey] = useState(0); // fuerza reset del form

  const handleSubmit = async (data: FormValues) => {
    setError('');
    setSuccess(false);

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

    setSuccess(true);
    setFormKey((k) => k + 1); // reset form
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Nuevo Colaborador</h2>
          <ColaboradorForm
            key={formKey}
            lideres={lideres}
            comunas={comunas}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
