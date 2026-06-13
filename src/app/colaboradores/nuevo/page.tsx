'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ColaboradorForm from '@/components/ColaboradorForm';
import { Lider } from '@/types';

type ColabFormValues = {
  cedula: string; nombre: string; apellidos: string;
  sexo: 'M' | 'F'; fecha_nacimiento: string;
  direccion: string; telefono: string; lider_cedula: string;
};

export default function NuevoColaboradorPage() {
  const router = useRouter();
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [error, setError] = useState('');
  const [loadingLideres, setLoadingLideres] = useState(true);

  useEffect(() => {
    fetch('/api/lideres')
      .then((r) => r.json())
      .then((data) => { setLideres(data); setLoadingLideres(false); })
      .catch(() => { setError('No se pudieron cargar los líderes'); setLoadingLideres(false); });
  }, []);

  const handleSubmit = async (data: ColabFormValues) => {
    setError('');
    const res = await fetch('/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Error al crear colaborador');
      return;
    }
    router.push(`/colaboradores/${result.id}`);
    router.refresh();
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/colaboradores" className="text-sm text-slate-400 hover:text-slate-600">
          ← Volver a Colaboradores
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Nuevo Colaborador</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {loadingLideres ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <ColaboradorForm lideres={lideres} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
