'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

const COLORS = [
  '#D4AF37', '#C9A227', '#B8860B', '#9B7D10', '#8B6914',
  '#FCD34D', '#F59E0B', '#D97706', '#B45309', '#92400E',
];

export default function EgresosAdminPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/expenses?year=${selectedYear}&month=${selectedMonth}`);
    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [selectedYear, selectedMonth]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !date) { setError('Completá todos los campos'); return; }
    setSaving(true); setError(''); setSuccess('');
    const res = await fetch('/api/admin/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: description.trim(), amount: parseFloat(amount), date }),
    });
    if (res.ok) {
      setDescription(''); setAmount('');
      setSuccess('Egreso cargado con éxito.');
      fetchExpenses();
    } else { setError('Error al guardar el egreso.'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar este egreso?')) return;
    await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Build pie chart data by grouping descriptions
  const grouped = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.description] = (acc[e.description] || 0) + e.amount;
    return acc;
  }, {});
  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: COLORS.slice(0, labels.length),
      borderColor: '#0a0a0a',
      borderWidth: 2,
    }],
  };

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Egresos</h1>
        <p className="text-dark-400 mt-1">Registrá los gastos del negocio</p>
      </div>

      {/* Month/Year Filter */}
      <div className="glass rounded-2xl p-6 flex flex-wrap gap-4 items-center">
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white">
          {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white">
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="ml-auto text-right">
          <p className="text-dark-400 text-sm">Total egresos</p>
          <p className="text-2xl font-bold text-red-400">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-heading font-semibold text-white">Cargar Egreso</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1">Descripción</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Compra de cera, alquiler..." required
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white placeholder-dark-600 focus:outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Monto ($)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" step="0.01" min="0" required
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white placeholder-dark-600 focus:outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}
            <button type="submit" disabled={saving}
              className="w-full btn-gold text-dark-950 font-bold py-3 rounded-xl disabled:opacity-50">
              {saving ? 'Guardando...' : 'Registrar Egreso'}
            </button>
          </form>
        </div>

        {/* Chart */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-heading font-semibold text-white mb-4">Distribución</h2>
          {labels.length > 0 ? (
            <div className="flex justify-center">
              <div style={{ maxWidth: 280 }}>
                <Doughnut data={chartData} options={{
                  plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 12 } } } },
                  cutout: '60%',
                }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-dark-500">
              No hay egresos este mes
            </div>
          )}
        </div>
      </div>

      {/* Expense List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-800">
          <h2 className="text-xl font-heading font-semibold text-white">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-dark-500">Cargando...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-dark-500">No hay egresos registrados este mes</div>
        ) : (
          <div className="divide-y divide-dark-800">
            {expenses.map(exp => (
              <div key={exp.id} className="flex items-center justify-between px-6 py-4 hover:bg-dark-900/50 transition-colors">
                <div>
                  <p className="text-white font-medium">{exp.description}</p>
                  <p className="text-dark-500 text-sm">{exp.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-400 font-semibold text-lg">
                    -${exp.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => handleDelete(exp.id)}
                    className="text-dark-600 hover:text-red-400 transition-colors p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
