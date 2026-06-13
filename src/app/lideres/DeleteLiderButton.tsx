'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteLiderButton({ id, nombre }: { id: number; nombre: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar al líder "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lideres/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'No se pudo eliminar el líder');
        return;
      }
      router.refresh();
    } catch {
      alert('Error al eliminar líder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  );
}
