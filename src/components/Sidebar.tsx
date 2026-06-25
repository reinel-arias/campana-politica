'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',               label: 'Dashboard',     icon: '⊞' },
  { href: '/lideres',        label: 'Líderes',        icon: '★' },
  { href: '/colaboradores',  label: 'Colaboradores',  icon: '⊹' },
  { href: '/barrios',        label: 'Barrios',        icon: '⌖' },
  { href: '/zonas',          label: 'Zonas',          icon: '◉' },
  { href: '/gestion',        label: 'Gestión',        icon: '✓' },
];

interface Props {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-full bg-slate-900 flex flex-col">
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg leading-tight">Campaña</h1>
        <p className="text-slate-400 text-xs mt-1">Gestión de Colaboradores</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">v1.0.0</p>
      </div>
    </aside>
  );
}
