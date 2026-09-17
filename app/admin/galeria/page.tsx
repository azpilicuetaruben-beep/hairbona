'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

export default function GaleriaAdmin() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setImages(data);
    } catch {
      console.error('Error fetching gallery');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_SIZE = 1200;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
            else resolve(file);
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Process each file (one by one for simplicity)
    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      const file = await compressImage(originalFile);
      
      const body = new FormData();
      body.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body,
        });
        const data = await res.json();
        if (data.url) {
          // Save to gallery immediately
          await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: data.url, caption: '', order: images.length + i + 1 }),
          });
        }
      } catch {
        console.error('Error uploading file');
      }
    }
    
    fetchImages();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) fetchImages();
    } catch {
      console.error('Error deleting image');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">Gestión de Galería</h1>
        <div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-gold text-dark-950 px-4 py-2 rounded-lg text-sm font-bold tracking-wide"
          >
            {uploading ? 'Subiendo...' : '+ Subir Fotos'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10"><div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto"></div></div>
      ) : images.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-dark-400">
          No hay fotos en la galería. Subí algunas para empezar.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map(img => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-dark-900 border border-dark-800">
              <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 backdrop-blur-sm"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
