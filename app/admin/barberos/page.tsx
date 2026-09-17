'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Barber {
  id: string;
  name: string;
  description: string;
  photo: string | null;
  whatsapp: string | null;
  order: number;
  active: boolean;
}

export default function BarberosAdmin() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Barber>>({});
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/barbers');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setBarbers(data);
    } catch {
      console.error('Error fetching barbers');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/admin/barbers/${editingId}` : '/api/admin/barbers';
      const method = editingId ? 'PATCH' : 'POST';
      
      // Defaults for new
      const body = {
        name: formData.name || '',
        description: formData.description || '',
        photo: formData.photo || null,
        whatsapp: formData.whatsapp || null,
        order: formData.order || 0,
        active: formData.active !== undefined ? formData.active : true,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setEditingId(null);
        setFormData({});
        fetchBarbers();
      }
    } catch {
      console.error('Error saving barber');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este barbero?')) return;
    try {
      const res = await fetch(`/api/admin/barbers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBarbers();
    } catch {
      console.error('Error deleting barber');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, photo: data.url });
      }
    } catch {
      console.error('Error uploading file');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">Gestión de Barberos</h1>
        <button
          onClick={() => {
            setEditingId('');
            setFormData({ active: true, order: barbers.length + 1 });
          }}
          className="btn-gold text-dark-950 px-4 py-2 rounded-lg text-sm font-bold tracking-wide"
        >
          + Nuevo Barbero
        </button>
      </div>

      {editingId !== null && (
        <div className="glass rounded-2xl p-6 mb-8 border border-gold-500/30">
          <h2 className="text-xl font-heading font-bold text-white mb-4">
            {editingId === '' ? 'Nuevo Barbero' : 'Editar Barbero'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Nombre</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">WhatsApp (con código de país ej: +549...)</label>
              <input 
                type="text" 
                value={formData.whatsapp || ''} 
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-dark-300 mb-1">Descripción</label>
              <textarea 
                value={formData.description || ''} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white h-24"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Orden de visualización</label>
              <input 
                type="number" 
                value={formData.order || 0} 
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer h-10">
                <input 
                  type="checkbox" 
                  checked={formData.active !== false} 
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 rounded bg-dark-900 border-dark-700 text-gold-500 focus:ring-gold-500"
                />
                Activo (visible en la web)
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-dark-300 mb-1">Foto</label>
              <div className="flex items-center gap-4">
                {formData.photo && (
                  <img src={formData.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-dark-700" />
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-dark-800 text-white rounded-lg text-sm hover:bg-dark-700 transition-colors"
                >
                  {uploading ? 'Subiendo...' : 'Subir Foto'}
                </button>
                <input 
                  type="text" 
                  value={formData.photo || ''} 
                  onChange={(e) => setFormData({...formData, photo: e.target.value})}
                  placeholder="URL de la imagen"
                  className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-4 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setEditingId(null); setFormData({}); }}
              className="px-4 py-2 rounded-lg text-sm text-dark-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gold-500 text-dark-950 rounded-lg text-sm font-bold"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10"><div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map(barber => (
            <div key={barber.id} className={`glass rounded-2xl p-5 ${!barber.active ? 'opacity-50' : ''}`}>
              <div className="flex gap-4 items-center mb-4">
                <img src={barber.photo || 'https://i.pravatar.cc/150'} alt={barber.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="text-white font-bold text-lg">{barber.name}</h3>
                  <span className="text-xs text-dark-400">Orden: {barber.order}</span>
                </div>
              </div>
              <p className="text-dark-400 text-sm mb-4 line-clamp-2">{barber.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-xs px-2 py-1 rounded ${barber.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {barber.active ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingId(barber.id); setFormData(barber); }}
                    className="p-2 rounded bg-dark-800 text-dark-300 hover:text-gold-400"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(barber.id)}
                    className="p-2 rounded bg-dark-800 text-dark-300 hover:text-red-400"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
