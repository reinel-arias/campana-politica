'use client';

import { useEffect, useState } from 'react';
import { Comuna } from '@/types';
import ComunasPanel from './ComunasPanel';
import BarriosPanel from './BarriosPanel';

export default function BarriosPage() {
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [selectedComunaId, setSelectedComunaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comunas')
      .then((r) => r.json())
      .then((data) => { setComunas(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleComunaSelect = (id: number | null) => {
    setSelectedComunaId(id);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Barrios y Comunas</h1>
        <p className="text-slate-500 text-sm mt-1">
          Haz clic en una comuna para filtrar sus barrios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '560px' }}>
        <ComunasPanel
          initialComunas={comunas}
          onComunaSelect={handleComunaSelect}
          selectedComunaId={selectedComunaId}
        />
        <BarriosPanel
          comunas={comunas}
          selectedComunaId={selectedComunaId}
        />
      </div>
    </div>
  );
}
