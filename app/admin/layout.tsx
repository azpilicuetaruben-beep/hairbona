'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const tabs = [
    { name: 'Turnos', path: '/admin' },
    { name: 'Barberos', path: '/admin/barberos' },
    { name: 'Servicios', path: '/admin/servicios' },
    { name: 'Ganancias', path: '/admin/ganancias' },
    { name: 'Egresos', path: '/admin/egresos' },
    { name: 'Galería', path: '/admin/galeria' },
    { name: 'Reseñas', path: '/admin/resenas' },
    { name: 'Config', path: '/admin/configuracion' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <nav className="glass border-b border-dark-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xl font-heading font-bold text-gold-gradient">HAIRBONA</span>
            <span className="text-dark-500 text-sm hidden sm:inline">Panel Admin</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6">
            {tabs.map(tab => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === tab.path ? 'bg-gold-500/10 text-gold-400' : 'text-dark-400 hover:text-white'
                }`}
              >
                {tab.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-dark-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1.5 ml-2"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
