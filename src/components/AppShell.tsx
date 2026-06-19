'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) setOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Backdrop móvil — toca para cerrar */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar
          Móvil:   posición fija, desliza con translate-x
          Desktop: en flujo flex, colapsa el ancho */}
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
        {/* Div interior de ancho fijo para que el sidebar no se deforme */}
        <div className="w-60 h-full">
          <Sidebar onLinkClick={() => setOpen(false)} />
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior con botón toggle */}
        <header className="sticky top-0 z-10 h-12 bg-white border-b border-slate-200 flex items-center px-4 shadow-sm">
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
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
