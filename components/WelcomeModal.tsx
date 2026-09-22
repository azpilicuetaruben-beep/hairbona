'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function WelcomeModal() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Solo mostramos el modal si ya terminó de cargar la sesión y no hay un usuario logueado
    if (status === 'loading') return;

    if (!session) {
      const hasVisited = localStorage.getItem('hairbona_visited');
      if (!hasVisited) {
        setShow(true);
      }
    }
  }, [session, status]);

  if (!show) return null;

  const handleGuest = () => {
    localStorage.setItem('hairbona_visited', 'true');
    setShow(false);
  };

  const handleLogin = () => {
    localStorage.setItem('hairbona_visited', 'true');
    signIn('google');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative glass rounded-3xl p-8 max-w-md w-full animate-fade-in-up border border-gold-500/20 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold-500/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">¡Bienvenido a Hairbona!</h2>
          <p className="text-dark-300 mb-8 text-sm">
            Iniciá sesión para llevar el control de tus turnos, acumular visitas para el programa de fidelidad y dejar reseñas. También podés entrar como invitado.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full btn-gold text-dark-950 px-6 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Iniciar con Google
            </button>
            <button
              onClick={handleGuest}
              className="w-full bg-dark-900 hover:bg-dark-800 text-white border border-dark-700 px-6 py-3.5 rounded-xl text-sm font-bold transition-colors"
            >
              Continuar como invitado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
