'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginGooglePage() {
  useEffect(() => {
    // Automatically trigger Google sign-in when this page loads
    signIn('google', { callbackUrl: '/' });
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-dark-400 text-sm">Redirigiendo al inicio de sesión con Google...</p>
      </div>
    </div>
  );
}
