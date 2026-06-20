'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) setOpen(false);
  }, []);

  // La pantalla de login se muestra sin shell
  if (pathname === '/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* Backdrop móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-30 w-60 overflow-hidden',
          'lg:relative lg:z-auto lg:flex-shrink-0',
          'transition-[transform,width] duration-300 ease-in-out',
          open
            ? 'translate-x-0 lg:w-60'
            : '-translate-x-full lg:w-0 lg:translate-x-0',
        ].join(' ')}
      >
        <div className="w-60 h-full">
          <Sidebar onLinkClick={() => setOpen(false)} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior */}
        <header className="sticky top-0 z-10 h-12 bg-white border-b border-slate-200 flex items-center px-4 shadow-sm">
          {/* Botón hamburguesa */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Botón cerrar sesión */}
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
