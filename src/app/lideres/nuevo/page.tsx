'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import LiderForm from '@/components/LiderForm';

export default function NuevoLiderPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (data: { cedula: string; nombre: string; apellidos: string; direccion: string; telefono: string }) => {
    setError('');
    const res = await fetch('/api/lideres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Error al crear líder');
      return;
    }
    router.push('/lideres');
    router.refresh();
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/lideres" className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
          ← Volver a Líderes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Nuevo Líder</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        <LiderForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
