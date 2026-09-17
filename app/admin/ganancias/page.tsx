'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ServiceDetail {
  id: string;
  name: string;
  price: number;
  time: string;
  customerName: string;
}

interface BarberEarnings {
  barber: {
    id: string;
    name: string;
    photo: string | null;
  };
  totalEarnings: number;
  appointmentsCount: number;
  services: ServiceDetail[];
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function GananciasAdmin() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<BarberEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/earnings?date=${selectedDate}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setEarnings(data);
    } catch {
      console.error('Error fetching earnings');
    }
    setLoading(false);
  }, [selectedDate, router]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${dayNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalDayEarnings = earnings.reduce((sum, barber) => sum + barber.totalEarnings, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Date navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeDate(-1)}
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
            onClick={() => changeDate(1)}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-dark-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="glass px-6 py-3 rounded-xl border border-gold-500/20">
          <p className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-1">Total del Día</p>
          <p className="text-2xl font-bold text-gold-400">{formatMoney(totalDayEarnings)}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
        </div>
      ) : earnings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-dark-400 text-lg font-medium">Sin ganancias registradas</p>
          <p className="text-dark-500 text-sm mt-1">No hay turnos completados para esta fecha.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {earnings.map((barberData) => (
            <div key={barberData.barber.id} className="glass rounded-2xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-dark-800/50">
                <div className="flex items-center gap-4">
                  <img 
                    src={barberData.barber.photo || 'https://i.pravatar.cc/150'} 
                    alt={barberData.barber.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-dark-700"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{barberData.barber.name}</h3>
                    <p className="text-dark-400 text-sm">{barberData.appointmentsCount} turnos completados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-1">Recaudación</p>
                  <p className="text-xl font-bold text-green-400">{formatMoney(barberData.totalEarnings)}</p>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-medium text-dark-300 mb-4">Desglose de servicios:</h4>
                <div className="space-y-3">
                  {barberData.services.map((service, index) => (
                    <div key={`${service.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-dark-900/50 border border-dark-800">
                      <div>
                        <p className="text-white text-sm font-medium">{service.name}</p>
                        <p className="text-dark-500 text-xs mt-0.5">{service.time} - {service.customerName}</p>
                      </div>
                      <p className="text-gold-400 font-semibold">{formatMoney(service.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
