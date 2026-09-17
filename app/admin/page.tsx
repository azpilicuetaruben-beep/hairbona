'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  service: {
    name: string;
    duration: number;
  };
  barber: {
    name: string;
  };
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'day' | 'week'>('day');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/admin/appointments';
      if (view === 'day') {
        url += `?date=${selectedDate}`;
      } else {
        const from = selectedDate;
        const toDate = new Date(selectedDate);
        toDate.setDate(toDate.getDate() + 6);
        const to = toDate.toISOString().split('T')[0];
        url += `?from=${from}&to=${to}`;
      }

      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setAppointments(data);
    } catch {
      console.error('Error fetching appointments');
    }
    setLoading(false);
  }, [selectedDate, view, router]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch {
      console.error('Error updating appointment');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este turno?')) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch {
      console.error('Error deleting appointment');
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${dayNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(view === 'day' ? -1 : -7)}
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-dark-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
                {formatDisplayDate(selectedDate)}
              </h1>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-gold-500 text-xs hover:text-gold-400 transition-colors"
              >
                Ir a hoy
              </button>
            </div>
            <button
              onClick={() => changeDate(view === 'day' ? 1 : 7)}
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-dark-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'day'
                  ? 'bg-gold-500 text-dark-950'
                  : 'glass text-dark-400 hover:text-white'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'week'
                  ? 'bg-gold-500 text-dark-950'
                  : 'glass text-dark-400 hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{confirmedCount}</p>
            <p className="text-dark-500 text-xs mt-1">Pendientes</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            <p className="text-dark-500 text-xs mt-1">Completados</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{cancelledCount}</p>
            <p className="text-dark-500 text-xs mt-1">Cancelados</p>
          </div>
        </div>

        {/* Appointments list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <svg className="w-12 h-12 text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-dark-400 text-lg font-medium">Sin turnos</p>
            <p className="text-dark-500 text-sm mt-1">No hay turnos registrados para esta fecha.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className={`glass rounded-xl p-4 sm:p-5 transition-all duration-200 ${
                  apt.status === 'cancelled' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Time */}
                  <div className="flex items-center gap-3 sm:w-32 flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                      <span className="text-gold-400 text-xs font-bold">{apt.startTime}</span>
                    </div>
                    <div className="sm:hidden">
                      <p className="text-white font-semibold">{apt.customerName}</p>
                      <p className="text-dark-500 text-xs">{apt.service.name}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 hidden sm:block">
                    <p className="text-white font-semibold">{apt.customerName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-dark-500 text-sm font-medium text-gold-400">Con {apt.barber?.name || 'Cualquiera'}</span>
                      <span className="text-dark-600 text-sm">•</span>
                      <span className="text-dark-500 text-sm">{apt.service.name}</span>
                      <span className="text-dark-600 text-sm">•</span>
                      <span className="text-dark-500 text-sm">{apt.customerPhone}</span>
                      <span className="text-dark-600 text-sm">•</span>
                      <span className="text-dark-500 text-sm">
                        {apt.startTime} - {apt.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Mobile info */}
                  <div className="flex items-center gap-3 text-xs text-dark-500 sm:hidden ml-13">
                    <span>{apt.customerPhone}</span>
                    <span>{apt.startTime} - {apt.endTime}</span>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        statusColors[apt.status]
                      }`}
                    >
                      {statusLabels[apt.status]}
                    </span>

                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, 'completed')}
                          className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors"
                          title="Marcar como completado"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                          className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Cancelar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Week view: show date */}
                {view === 'week' && (
                  <div className="mt-2 pt-2 border-t border-dark-800/50">
                    <span className="text-dark-500 text-xs">{formatDisplayDate(apt.date)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
