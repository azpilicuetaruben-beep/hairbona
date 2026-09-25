'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  stock: number;
  price: number;
  order: number;
  active: boolean;
}

export default function ProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setProducts(data);
    } catch {
      console.error('Error fetching products');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const startEditing = (product: Product | null) => {
    if (product) {
      setEditingId(product.id);
      setEditForm({
        name: product.name,
        description: product.description || '',
        image: product.image || '',
        stock: product.stock,
        price: product.price,
      });
    } else {
      setEditingId('new');
      setEditForm({
        name: '',
        description: '',
        image: '',
        stock: 0,
        price: 0,
      });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
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
        setEditForm({ ...editForm, image: data.url });
      }
    } catch (error) {
      console.error('Error uploading image', error);
      alert('Error al subir la imagen');
    }
    setUploading(false);
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      const isNew = editingId === 'new';
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingId}`;
      const method = isNew ? 'POST' : 'PATCH';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          image: editForm.image || null,
          stock: Number(editForm.stock),
          price: Number(editForm.price),
        }),
      });
      
      if (res.ok) {
        fetchProducts();
        setEditingId(null);
        setEditForm({});
      } else {
        alert('Error al guardar el producto');
      }
    } catch {
      console.error('Error saving product');
    }
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Error al eliminar');
      }
    } catch {
      console.error('Error deleting product');
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Gestión de Productos
          </h2>
          <button
            onClick={() => startEditing(null)}
            className="btn-gold text-dark-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {editingId === 'new' && (
              <div className="glass rounded-xl p-5 border border-gold-500/30">
                <h3 className="text-white font-bold mb-4">Crear Nuevo Producto</h3>
                <ProductForm 
                  editForm={editForm} 
                  setEditForm={setEditForm} 
                  cancelEditing={cancelEditing} 
                  saveProduct={saveProduct} 
                  saving={saving} 
                  uploading={uploading} 
                  handleFileUpload={handleFileUpload} 
                  fileInputRef={fileInputRef} 
                />
              </div>
            )}
            
            {products.map((product) => (
              <div key={product.id} className="glass rounded-xl p-5 transition-all duration-200">
                {editingId === product.id ? (
                  <div className="space-y-4">
                    <h3 className="text-white font-bold mb-4">Editar Producto</h3>
                    <ProductForm 
                      editForm={editForm} 
                      setEditForm={setEditForm} 
                      cancelEditing={cancelEditing} 
                      saveProduct={saveProduct} 
                      saving={saving} 
                      uploading={uploading} 
                      handleFileUpload={handleFileUpload} 
                      fileInputRef={fileInputRef} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gold-500/30" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-500 text-xs">Sin foto</div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                        {product.description && (
                          <p className="text-dark-400 text-sm mt-0.5 line-clamp-1">{product.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            Stock: {product.stock}
                          </span>
                          <span className="text-gold-400 text-sm font-semibold">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEditing(product)}
                        className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 hover:bg-gold-500/20 transition-colors"
                        title="Editar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Eliminar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

function ProductForm({ 
  editForm, 
  setEditForm, 
  cancelEditing, 
  saveProduct, 
  saving, 
  uploading, 
  handleFileUpload, 
  fileInputRef 
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Nombre *</label>
          <input
            type="text"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
            placeholder="Ej: Cera mate"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Descripción (Opcional)</label>
          <input
            type="text"
            value={editForm.description || ''}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
            placeholder="Si la dejás en blanco, no aparecerá en la web."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Imagen (Opcional)</label>
          <div className="flex items-center gap-4">
            {editForm.image && (
              <img src={editForm.image} alt="Preview" className="w-12 h-12 rounded object-cover border border-dark-700" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors text-sm border border-dark-600 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {uploading ? 'Subiendo...' : 'Subir Imagen'}
            </button>
            {editForm.image && (
              <button 
                onClick={() => setEditForm({ ...editForm, image: '' })}
                className="text-red-400 hover:text-red-300 text-sm ml-2"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Stock</label>
          <input
            type="number"
            value={editForm.stock || 0}
            onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
            min={0}
            step={1}
          />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Precio ($) *</label>
          <input
            type="number"
            value={editForm.price ?? ''}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value ? Number(e.target.value) : 0 })}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500"
            min={0}
            step={100}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-3 justify-end pt-2 border-t border-dark-800">
        <button
          onClick={cancelEditing}
          className="px-4 py-2 rounded-lg text-sm text-dark-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={saveProduct}
          disabled={saving || !editForm.name || editForm.price === undefined}
          className="btn-gold text-dark-950 px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
