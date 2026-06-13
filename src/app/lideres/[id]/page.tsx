'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import LiderForm from '@/components/LiderForm';
import { Lider } from '@/types';

type LiderFormValues = { cedula: string; nombre: string; apellidos: string; direccion: string; telefono: string };

export default function EditarLiderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [lider, setLider] = useState<Lider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/lideres/${id}`)
      .then((r) => r.json())
      .then((data) => { setLider(data); setLoading(false); })
      .catch(() => { setError('No se pudo cargar el líder'); setLoading(false); });
  }, [id]);

  const handleSubmit = async (data: LiderFormValues) => {
    setSaving(true);
    setError('');
    setSuccess(false);
    const res = await fetch(`/api/lideres/${id}`, {
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
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded animate-pulse mb-4 w-32" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!lider) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <p className="text-red-600">Líder no encontrado</p>
        <Link href="/lideres" className="text-blue-600 text-sm mt-2 inline-block hover:underline">← Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/lideres" className="text-sm text-slate-400 hover:text-slate-600">
          ← Volver a Líderes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">
          {lider.apellidos}, {lider.nombre}
        </h1>
        <p className="text-slate-400 text-sm">CC {lider.cedula}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Líder actualizado correctamente
          </div>
        )}
        <LiderForm
          defaultValues={lider}
          onSubmit={handleSubmit}
          isLoading={saving}
        />
      </div>
    </div>
  );
}
