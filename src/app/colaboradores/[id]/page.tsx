'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ColaboradorForm from '@/components/ColaboradorForm';
import HabilidadesPanel from '@/components/HabilidadesPanel';
import { Colaborador, Habilidades, Lider } from '@/types';

type ColabFormValues = {
  cedula: string; nombre: string; apellidos: string;
  sexo: 'M' | 'F'; fecha_nacimiento: string;
  direccion: string; telefono: string; lider_cedula: string;
};


export default function EditarColaboradorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/colaboradores/${id}`).then((r) => r.json()),
      fetch('/api/lideres').then((r) => r.json()),
    ])
      .then(([col, lids]) => {
        setColaborador(col);
        setLideres(lids);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la información');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (data: ColabFormValues) => {
    setSaving(true);
    setError('');
    setSuccess(false);
    const res = await fetch(`/api/colaboradores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(result.error || 'Error al actualizar');
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-slate-100 rounded animate-pulse w-40" />
        <div className="h-80 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!colaborador || (colaborador as unknown as { error?: string }).error) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <p className="text-red-600">Colaborador no encontrado</p>
        <Link href="/colaboradores" className="text-blue-600 text-sm mt-2 inline-block hover:underline">← Volver</Link>
      </div>
    );
  }

  const habilidades: Habilidades = {
    vehiculo:       !!(colaborador as unknown as Record<string, unknown>).vehiculo,
    perifoneo:      !!(colaborador as unknown as Record<string, unknown>).perifoneo,
    orador_publico: !!(colaborador as unknown as Record<string, unknown>).orador_publico,
    redes_sociales: !!(colaborador as unknown as Record<string, unknown>).redes_sociales,
  };

  const defaultValues: ColabFormValues = {
    cedula:           colaborador.cedula,
    nombre:           colaborador.nombre,
    apellidos:        colaborador.apellidos,
    sexo:             colaborador.sexo,
    fecha_nacimiento: colaborador.fecha_nacimiento?.split('T')[0] ?? '',
    direccion:        colaborador.direccion,
    telefono:         colaborador.telefono,
    lider_cedula:     colaborador.lider_cedula,
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/colaboradores" className="text-sm text-slate-400 hover:text-slate-600">
          ← Volver a Colaboradores
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">
          {colaborador.apellidos}, {colaborador.nombre}
        </h1>
        <p className="text-slate-400 text-sm">CC {colaborador.cedula}</p>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Datos Personales</h2>
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
            lideres={lideres}
            onSubmit={handleSubmit}
            isLoading={saving}
          />
        </div>

        <HabilidadesPanel
          colaboradorId={colaborador.id}
          initial={habilidades}
        />
      </div>
    </div>
  );
}
