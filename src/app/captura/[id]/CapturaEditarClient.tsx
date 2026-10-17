'use client';

import { useState, ComponentProps } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ColaboradorForm from '@/components/ColaboradorForm';
import HabilidadesPanel from '@/components/HabilidadesPanel';
import { Comuna, Zona, Habilidades } from '@/types';
import CapturaHeader from '../CapturaHeader';

type FormProps = ComponentProps<typeof ColaboradorForm>;
type FormValues = Parameters<FormProps['onSubmit']>[0];

interface Props {
  nombreLider: string;
  colaboradorId: number;
  titulo: string;
  cedula: string;
  comunas: Comuna[];
  zonas: Zona[];
  defaultValues: FormProps['defaultValues'];
  habilidades: Habilidades;
}

export default function CapturaEditarClient({
  nombreLider, colaboradorId, titulo, cedula, comunas, zonas, defaultValues, habilidades,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: FormValues) => {
    setSaving(true);
    setError('');
    setSuccess(false);
    const res = await fetch(`/api/colaboradores/${colaboradorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        barrio_id: data.barrio_id ? Number(data.barrio_id) : null,
        puesto_votacion_id: data.puesto_votacion_id ? Number(data.puesto_votacion_id) : null,
      }),
    });
    const result = await res.json();
    setSaving(false);
    if (!res.ok) { setError(result.error || 'Error al actualizar'); return; }
    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CapturaHeader nombreLider={nombreLider} />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div>
          <Link href="/captura" className="text-sm text-slate-400 hover:text-slate-600">
            ← Volver al listado
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-3">{titulo}</h2>
          <p className="text-slate-400 text-sm">CC {cedula}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Datos del Colaborador</h2>
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Colaborador actualizado correctamente
            </div>
          )}
          <ColaboradorForm
            defaultValues={defaultValues}
            lideres={[]}
            comunas={comunas}
            zonas={zonas}
            hideLider
            onSubmit={handleSubmit}
            isLoading={saving}
          />
        </div>

        <HabilidadesPanel colaboradorId={colaboradorId} initial={habilidades} />
      </div>
    </div>
  );
}
