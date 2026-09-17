'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServiceDetail {
  id: string;
  name: string;
  price: number;
  time: string;
  customerName: string;
  isManual?: boolean;
  date?: string;
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

const COLORS = ['#D4AF37', '#8B6508', '#F3E5AB', '#DAA520', '#FFDF00', '#B8860B'];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function GananciasAdmin() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<BarberEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('day');
  
  // Date states for generic view
  const [selectedDay, setSelectedDay] = useState(formatDate(new Date()));
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [manualForm, setManualForm] = useState({
    barberId: '',
    serviceId: '',
    amount: '',
    description: '',
    date: formatDate(new Date())
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate date range based on period
  const getDateRange = useCallback(() => {
    const to = new Date();
    let from = new Date();

    if (period === 'day') {
      from = new Date(selectedDay + 'T12:00:00');
      to.setTime(from.getTime());
    } else if (period === 'week') {
      from.setDate(to.getDate() - 7);
    } else if (period === 'month') {
      from.setMonth(to.getMonth() - 1);
    } else if (period === 'all') {
      from = new Date('2020-01-01'); // Long time ago
    }

    return {
      fromStr: formatDate(from),
      toStr: formatDate(to)
    };
  }, [period, selectedDay]);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const { fromStr, toStr } = getDateRange();
      const res = await fetch(`/api/admin/earnings?from=${fromStr}&to=${toStr}`);
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
  }, [getDateRange, router]);

  const fetchFormOptions = async () => {
    try {
      const [barbersRes, servicesRes] = await Promise.all([
        fetch('/api/admin/barbers'),
        fetch('/api/admin/services')
      ]);
      const barbersData = await barbersRes.json();
      const servicesData = await servicesRes.json();
      setBarbers(barbersData.filter((b: any) => b.active));
      setServices(servicesData.filter((s: any) => s.active));
    } catch (e) {
      console.error('Error loading form options', e);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  useEffect(() => {
    if (isModalOpen && barbers.length === 0) {
      fetchFormOptions();
    }
  }, [isModalOpen]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/manual-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualForm,
          serviceId: manualForm.serviceId || null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setManualForm({
          barberId: '',
          serviceId: '',
          amount: '',
          description: '',
          date: formatDate(new Date())
        });
        fetchEarnings();
      } else {
        alert('Error al guardar el ingreso.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
    setSubmitting(false);
  };

  const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sid = e.target.value;
    const s = services.find(srv => srv.id === sid);
    setManualForm({
      ...manualForm,
      serviceId: sid,
      amount: s?.price ? s.price.toString() : manualForm.amount
    });
  };

  const totalEarnings = earnings.reduce((sum, barber) => sum + barber.totalEarnings, 0);
  const totalAppointments = earnings.reduce((sum, barber) => sum + barber.appointmentsCount, 0);

  // Chart Data preparation
  const chartData = earnings.map(b => ({
    name: b.barber.name,
    value: b.totalEarnings
  })).filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-heading font-bold text-white">Panel de Ganancias</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold text-dark-950 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Ingreso Manual
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-900 rounded-xl p-1 mb-6 max-w-fit">
        {['day', 'week', 'month', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setPeriod(tab as any)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              period === tab
                ? 'bg-gold-500 text-dark-950 shadow-lg'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            {tab === 'day' && 'Día'}
            {tab === 'week' && 'Última Semana'}
            {tab === 'month' && 'Último Mes'}
            {tab === 'all' && 'Histórico'}
          </button>
        ))}
      </div>

      {/* Date Picker for 'day' */}
      {period === 'day' && (
        <div className="flex items-center gap-3 mb-6">
          <input 
            type="date" 
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-white rounded-lg px-4 py-2"
          />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="glass px-6 py-5 rounded-2xl border border-gold-500/20 flex flex-col items-center justify-center">
          <p className="text-dark-400 text-sm font-medium uppercase tracking-wider mb-2">Recaudación Total</p>
          <p className="text-4xl font-bold text-gold-400">{formatMoney(totalEarnings)}</p>
        </div>
        <div className="glass px-6 py-5 rounded-2xl border border-dark-700 flex flex-col items-center justify-center">
          <p className="text-dark-400 text-sm font-medium uppercase tracking-wider mb-2">Servicios Brindados</p>
          <p className="text-4xl font-bold text-white">{totalAppointments}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
        </div>
      ) : earnings.length === 0 || totalEarnings === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-dark-400 text-lg font-medium">Sin ingresos en este periodo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart */}
          <div className="lg:col-span-1 glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-white font-bold mb-4">Distribución por Barbero</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatMoney(value as number)}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: 'white' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Barbers List */}
          <div className="lg:col-span-2 space-y-6">
            {earnings.filter(e => e.totalEarnings > 0).map((barberData) => (
              <div key={barberData.barber.id} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-800/50">
                  <div className="flex items-center gap-4">
                    <img 
                      src={barberData.barber.photo || 'https://i.pravatar.cc/150'} 
                      alt={barberData.barber.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-dark-700"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">{barberData.barber.name}</h3>
                      <p className="text-dark-400 text-xs">{barberData.appointmentsCount} servicios</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">{formatMoney(barberData.totalEarnings)}</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {barberData.services.map((service, index) => (
                    <div key={`${service.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-dark-900/50 border border-dark-800 text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{service.name}</p>
                          {service.isManual && <span className="bg-gold-500/20 text-gold-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Manual</span>}
                        </div>
                        <p className="text-dark-500 text-xs mt-0.5">
                          {period !== 'day' ? `${service.date} ` : ''} 
                          {service.time !== '-' ? `(${service.time})` : ''} - {service.customerName}
                        </p>
                      </div>
                      <p className="text-gold-400 font-semibold">{formatMoney(service.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-950 border border-dark-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Cargar Ingreso Manual</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm text-dark-300 mb-1">Barbero *</label>
                <select 
                  required
                  value={manualForm.barberId}
                  onChange={e => setManualForm({...manualForm, barberId: e.target.value})}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
                >
                  <option value="">Seleccionar...</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Fecha *</label>
                <input 
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={e => setManualForm({...manualForm, date: e.target.value})}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Vincular a Servicio (Opcional)</label>
                <select 
                  value={manualForm.serviceId}
                  onChange={handleServiceSelect}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
                >
                  <option value="">Ingreso Libre (Sin servicio)</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({formatMoney(s.price || 0)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Monto ($) *</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={manualForm.amount}
                  onChange={e => setManualForm({...manualForm, amount: e.target.value})}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
                />
              </div>

              {!manualForm.serviceId && (
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Descripción / Concepto</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Venta de cera, Corte al paso..."
                    value={manualForm.description}
                    onChange={e => setManualForm({...manualForm, description: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-dark-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gold-500 text-dark-950 font-bold px-6 py-2 rounded-xl"
                >
                  {submitting ? 'Guardando...' : 'Guardar Ingreso'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
