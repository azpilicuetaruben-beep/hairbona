'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Visit {
  id: string;
  date: string;
  serviceName: string | null;
  barberName: string | null;
}

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  service: { name: string };
  barber: { name: string };
}

interface ProfileData {
  visits: Visit[];
  appointments: Appointment[];
  loyaltyVisits: number;
  loyaltyMessage: string;
}

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} de ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = () => {
    if (session?.user?.email) {
      setLoading(true);
      fetch(`/api/profile?userId=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => { setProfileData(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés cancelar este turno?')) return;
    try {
      const res = await fetch(`/api/appointments`, { // we need a cancel endpoint for users, wait we can just use the public one if we create it, or use the delete endpoint? Oh wait, the admin endpoint requires admin session! I will create a public cancel endpoint. Wait, actually we can just pass the appointment ID to a new endpoint `/api/appointments/cancel` with the ID. 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel' }),
      });
      if (res.ok) {
        alert('Turno cancelado.');
        fetchProfile();
      } else {
        alert('Error al cancelar turno.');
      }
    } catch {
      alert('Error al cancelar turno.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-3">Mi Perfil</h1>
          <p className="text-dark-400 mb-8">Iniciá sesión con Google para ver tu historial de visitas, turnos y recompensas.</p>
          <button
            onClick={() => signIn('google')}
            className="btn-gold text-dark-950 px-8 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          </button>
          <Link href="/" className="block mt-4 text-dark-500 hover:text-white transition-colors text-sm">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const visitCount = profileData?.visits.length || 0;
  const loyaltyVisits = profileData?.loyaltyVisits || 10;
  const visitsInCycle = visitCount % loyaltyVisits;
  const progress = (visitsInCycle / loyaltyVisits) * 100;
  const hasReward = visitCount > 0 && visitsInCycle === 0;
  
  const pendingAppointments = profileData?.appointments?.filter(a => a.status === 'confirmed') || [];
  const pastAppointments = profileData?.appointments?.filter(a => a.status !== 'confirmed') || [];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <nav className="glass py-4 sticky top-0 z-50 border-b border-dark-800/50">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Hairbona" className="h-8 w-auto rounded-full" />
            <span className="text-xl font-heading font-bold text-gold-gradient hidden sm:block">HAIRBONA</span>
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="text-dark-400 hover:text-white transition-colors text-sm">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Profile card */}
        <div className="glass rounded-2xl p-6 flex items-center gap-5 animate-fade-in-up">
          {session.user?.image ? (
            <img src={session.user.image} alt={session.user.name || ''} className="w-16 h-16 rounded-full border-2 border-gold-500/30" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center text-2xl text-gold-400">
              {session.user?.name?.[0] || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">{session.user?.name}</h1>
            <p className="text-dark-400 text-sm">{session.user?.email}</p>
            <p className="text-gold-400 text-sm mt-1 font-medium">{visitCount} visita{visitCount !== 1 ? 's' : ''} en total</p>
          </div>
        </div>

        {/* Reward card */}
        {hasReward ? (
          <div className="glass rounded-2xl p-6 border border-gold-500/40 glow-gold animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏆</span>
              <h2 className="text-xl font-heading font-bold text-gold-400">¡Recompensa Disponible!</h2>
            </div>
            <p className="text-white">{profileData?.loyaltyMessage}</p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-heading font-semibold text-white">Programa de fidelidad</h2>
              <span className="text-dark-400 text-sm">{visitsInCycle}/{loyaltyVisits} visitas</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-dark-500 text-sm mt-2">
              {loyaltyVisits - visitsInCycle} visita{(loyaltyVisits - visitsInCycle) !== 1 ? 's' : ''} más para tu próxima recompensa
            </p>
          </div>
        )}

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-dark-800 bg-gold-500/10">
              <h2 className="text-lg font-heading font-semibold text-white">Turnos Pendientes</h2>
            </div>
            <div className="divide-y divide-dark-800">
              {pendingAppointments.map(appt => (
                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-white font-medium text-lg">{appt.service.name}</p>
                    <p className="text-gold-400 text-sm font-semibold">{formatDate(appt.date)} a las {appt.startTime} hs</p>
                    <p className="text-dark-500 text-sm mt-1">Con {appt.barber.name}</p>
                  </div>
                  <button onClick={() => handleCancelAppointment(appt.id)}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 self-start sm:self-center">
                    Cancelar Turno
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments (History) */}
        <div className="glass rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-dark-800">
            <h2 className="text-lg font-heading font-semibold text-white">Historial de Turnos</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-dark-500">Cargando...</div>
          ) : pastAppointments.length === 0 ? (
            <div className="p-8 text-center text-dark-500">
              <p>Aún no tenés historial de turnos.</p>
              <Link href="/reservar" className="text-gold-400 hover:underline mt-2 inline-block">Reservar un turno →</Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-800">
              {pastAppointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-white font-medium">{appt.service.name}</p>
                    <p className="text-dark-400 text-sm">{formatDate(appt.date)} · {appt.startTime} hs</p>
                    <p className="text-dark-500 text-sm">Con {appt.barber.name}</p>
                  </div>
                  <div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      appt.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      appt.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                      'bg-dark-700 text-dark-300'
                    }`}>
                      {appt.status === 'completed' ? 'Completado' : appt.status === 'cancelled' ? 'Cancelado' : appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
