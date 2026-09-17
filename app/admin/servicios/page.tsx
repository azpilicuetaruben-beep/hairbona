'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  order: number;
  active: boolean;
}

export default function ServiciosPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setServices(data);
    } catch {
      console.error('Error fetching services');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const startEditing = (service: Service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveService = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          duration: Number(editForm.duration),
          price: editForm.price !== null && editForm.price !== undefined ? Number(editForm.price) : null,
        }),
      });
      if (res.ok) {
        fetchServices();
        setEditingId(null);
        setEditForm({});
      }
    } catch {
      console.error('Error updating service');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Gestión de Servicios
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="glass rounded-xl p-5 transition-all duration-200">
                {editingId === service.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-dark-300 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-dark-300 mb-1">Descripción</label>
                        <input
                          type="text"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-dark-300 mb-1">Duración (minutos)</label>
                        <input
                          type="number"
                          value={editForm.duration || 0}
                          onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })}
                          className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                          min={5}
                          step={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-dark-300 mb-1">Precio ($)</label>
                        <input
                          type="number"
                          value={editForm.price ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value ? Number(e.target.value) : null })}
                          className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
                          min={0}
                          step={100}
                          placeholder="Sin precio"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 rounded-lg text-sm text-dark-400 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveService(service.id)}
                        disabled={saving}
                        className="btn-gold text-dark-950 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{service.name}</h3>
                      <p className="text-dark-400 text-sm mt-0.5">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-dark-500 text-xs flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {service.duration} min
                        </span>
                        <span className="text-gold-400 text-sm font-semibold">
                          {service.price ? `$${service.price.toLocaleString()}` : 'Sin precio'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditing(service)}
                      className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 hover:bg-gold-500/20 transition-colors flex-shrink-0"
                      title="Editar servicio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
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
