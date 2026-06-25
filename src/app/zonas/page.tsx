'use client';

import { useEffect, useState } from 'react';
import { Zona } from '@/types';
import ZonasPanel from './ZonasPanel';
import PuestosPanel from './PuestosPanel';

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [selectedZonaId, setSelectedZonaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadZonas = async () => {
    const res = await fetch('/api/zonas');
    if (res.ok) setZonas(await res.json());
  };

  useEffect(() => {
    fetch('/api/zonas')
      .then(r => r.json())
      .then(data => { setZonas(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-slate-900">Zonas y Puestos de Votación</h1>
        <p className="text-slate-500 text-sm mt-1">Haz clic en una zona para ver sus puestos</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '560px' }}>
        <ZonasPanel
          zonas={zonas}
          selectedZonaId={selectedZonaId}
          onZonaSelect={setSelectedZonaId}
          onZonasChange={reloadZonas}
        />
        <PuestosPanel
          zonas={zonas}
          selectedZonaId={selectedZonaId}
        />
      </div>
    </div>
  );
}
