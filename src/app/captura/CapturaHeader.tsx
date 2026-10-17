'use client';

import { useRouter } from 'next/navigation';

export default function CapturaHeader({ nombreLider }: { nombreLider: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/captura/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-bold text-lg">Campaña Política</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Portal del Líder
          {nombreLider && <span className="ml-2 text-slate-300">· {nombreLider}</span>}
        </p>
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
  );
}
