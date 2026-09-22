'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ScheduleRule {
  id: string;
  dayOfWeek: number | null;
  date: string | null;
  startTime: string;
  endTime: string;
  isBlock: boolean;
  label: string | null;
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function GlobalConfigForm() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      alert('Configuración guardada exitosamente');
    } catch {
      alert('Error guardando configuración');
    }
    setSaving(false);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setConfig({ ...config, heroImage: data.url });
        // Auto-save
        await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, heroImage: data.url })
        });
      }
    } catch {
      alert('Error subiendo imagen');
    }
    setUploading(false);
  };

  const removeHeroImage = async () => {
    setConfig({ ...config, heroImage: '' });
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, heroImage: '' })
    });
  };

  if (loading) return <div className="text-dark-500">Cargando configuración...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm text-dark-300 mb-1">WhatsApp (con código de país ej: +549...)</label>
        <input 
          type="text" 
          value={config.whatsappNumber || ''} 
          onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})}
          className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-dark-300 mb-1">Subtítulo del Hero (texto debajo del título principal)</label>
        <textarea 
          value={config.heroSubtitle || ''} 
          onChange={(e) => setConfig({...config, heroSubtitle: e.target.value})}
          className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white resize-none"
          rows={3}
          placeholder="Tu barbería de confianza. Estilo, precisión y atención personalizada en cada visita."
        />
      </div>

      {/* Loyalty Program */}
      <div className="border border-dark-700 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🏆</span> Programa de Fidelidad
        </h3>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Visitas necesarias para ganar recompensa</label>
          <input 
            type="number"
            min="1"
            max="100"
            value={config.loyaltyVisits || '10'} 
            onChange={(e) => setConfig({...config, loyaltyVisits: e.target.value})}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Mensaje de recompensa (lo ve el cliente cuando la gana)</label>
          <textarea 
            value={config.loyaltyMessage || ''} 
            onChange={(e) => setConfig({...config, loyaltyMessage: e.target.value})}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white resize-none"
            rows={3}
            placeholder="¡Felicitaciones! Ganaste una recompensa especial. Mostrá este mensaje en tu próxima visita."
          />
        </div>
      </div>

      {/* Hero Image Upload */}
      <div>
        <label className="block text-sm text-dark-300 mb-2">Imagen de Fondo (Hero)</label>
        {config.heroImage ? (
          <div className="relative rounded-xl overflow-hidden border border-dark-700">
            <img src={config.heroImage} alt="Hero Background" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="bg-gold-500 text-dark-950 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-gold-400 transition-colors">
                Cambiar
                <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={removeHeroImage}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-400 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-700 rounded-xl cursor-pointer hover:border-gold-500/50 transition-colors bg-dark-900">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-8 h-8 text-dark-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-dark-500 text-sm">Tocá para subir una imagen</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-gold text-dark-950 px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for new block
  const [blockType, setBlockType] = useState<'date' | 'day'>('date');
  const [blockDate, setBlockDate] = useState('');
  const [blockDay, setBlockDay] = useState(1);
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('13:00');
  const [blockLabel, setBlockLabel] = useState('');
  const [isBlock, setIsBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/schedule');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setRules(data);
    } catch {
      console.error('Error fetching schedule');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        startTime: blockStartTime,
        endTime: blockEndTime,
        isBlock,
        label: blockLabel || null,
      };

      if (blockType === 'date') {
        body.date = blockDate;
      } else {
        body.dayOfWeek = blockDay;
      }

      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchRules();
        setBlockLabel('');
        setBlockDate('');
      }
    } catch {
      console.error('Error creating rule');
    }
    setSubmitting(false);
  };

  const deleteRule = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta regla?')) return;
    try {
      const res = await fetch(`/api/admin/schedule/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchRules();
      }
    } catch {
      console.error('Error deleting rule');
    }
  };

  // Separate recurring rules from date blocks
  const recurringRules = rules.filter((r) => r.dayOfWeek !== null && !r.isBlock);
  const dateBlocks = rules.filter((r) => r.isBlock);
  const recurringBlocks = rules.filter((r) => r.dayOfWeek !== null && r.isBlock);

  // Group recurring rules by day
  const rulesByDay = recurringRules.reduce(
    (acc, rule) => {
      const day = rule.dayOfWeek!;
      if (!acc[day]) acc[day] = [];
      acc[day].push(rule);
      return acc;
    },
    {} as Record<number, ScheduleRule[]>
  );

  return (
    <div>


      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Global Config */}
        <section className="mb-12">
          <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración Global
          </h2>
          <div className="glass rounded-2xl p-6">
            <GlobalConfigForm />
          </div>
        </section>

        {/* Current schedule */}
        <section className="mb-12">
          <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Horarios de Atención
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((day) => {
                const dayRules = rulesByDay[day] || [];
                return (
                  <div key={day} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium w-24">{dayNames[day]}</span>
                      {dayRules.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {dayRules.map((rule) => (
                            <span
                              key={rule.id}
                              className="px-3 py-1 rounded-lg bg-gold-500/10 text-gold-400 text-sm flex items-center gap-2"
                            >
                              {rule.startTime} - {rule.endTime}
                              {rule.label && (
                                <span className="text-dark-500 text-xs">({rule.label})</span>
                              )}
                              <button
                                onClick={() => deleteRule(rule.id)}
                                className="text-dark-500 hover:text-red-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-dark-500 text-sm">Cerrado</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Sunday */}
              <div className="glass rounded-xl p-4 flex items-center gap-3 opacity-50">
                <span className="text-white font-medium w-24">{dayNames[0]}</span>
                <span className="text-dark-500 text-sm">Cerrado</span>
              </div>
            </div>
          )}
        </section>

        {/* Active blocks */}
        {(dateBlocks.length > 0 || recurringBlocks.length > 0) && (
          <section className="mb-12">
            <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Bloqueos Activos
            </h2>

            <div className="space-y-2">
              {dateBlocks.map((block) => (
                <div key={block.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs font-semibold uppercase">
                      Bloqueado
                    </span>
                    <span className="text-white text-sm">
                      {block.date
                        ? `${block.date} — ${block.startTime} a ${block.endTime}`
                        : `${dayNames[block.dayOfWeek!]} — ${block.startTime} a ${block.endTime}`}
                    </span>
                    {block.label && (
                      <span className="text-dark-500 text-xs">({block.label})</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRule(block.id)}
                    className="text-dark-500 hover:text-red-400 transition-colors"
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
              ))}
            </div>
          </section>
        )}

        {/* Add new rule/block */}
        <section>
          <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Regla / Bloqueo
          </h2>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
            {/* Type toggle */}
            <div>
              <label className="block text-sm text-dark-300 font-medium mb-2">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlock(true)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isBlock ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-dark-400'
                  }`}
                >
                  🚫 Bloquear Horario
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlock(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !isBlock ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass text-dark-400'
                  }`}
                >
                  ✅ Agregar Horario
                </button>
              </div>
            </div>

            {/* Apply to */}
            <div>
              <label className="block text-sm text-dark-300 font-medium mb-2">Aplicar a</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBlockType('date')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    blockType === 'date' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'glass text-dark-400'
                  }`}
                >
                  Fecha específica
                </button>
                <button
                  type="button"
                  onClick={() => setBlockType('day')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    blockType === 'day' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'glass text-dark-400'
                  }`}
                >
                  Día de la semana
                </button>
              </div>
            </div>

            {/* Date or Day selector */}
            {blockType === 'date' ? (
              <div>
                <label htmlFor="block-date" className="block text-sm text-dark-300 font-medium mb-1.5">
                  Fecha
                </label>
                <input
                  id="block-date"
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="block-day" className="block text-sm text-dark-300 font-medium mb-1.5">
                  Día
                </label>
                <select
                  id="block-day"
                  value={blockDay}
                  onChange={(e) => setBlockDay(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <option key={d} value={d}>
                      {dayNames[d]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="block-start" className="block text-sm text-dark-300 font-medium mb-1.5">
                  Desde
                </label>
                <input
                  id="block-start"
                  type="time"
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="block-end" className="block text-sm text-dark-300 font-medium mb-1.5">
                  Hasta
                </label>
                <input
                  id="block-end"
                  type="time"
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Label */}
            <div>
              <label htmlFor="block-label" className="block text-sm text-dark-300 font-medium mb-1.5">
                Etiqueta (opcional)
              </label>
              <input
                id="block-label"
                type="text"
                value={blockLabel}
                onChange={(e) => setBlockLabel(e.target.value)}
                placeholder="Ej: Turno médico, Feriado, etc."
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gold text-dark-950 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : isBlock ? (
                '🚫 Crear Bloqueo'
              ) : (
                '✅ Agregar Horario'
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
