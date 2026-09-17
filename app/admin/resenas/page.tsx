'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function ReviewsAdminPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setReviews(data);
    } catch {
      console.error('Error fetching reviews');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const deleteReview = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta reseña?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch {
      console.error('Error deleting review');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Reseñas de Clientes ({reviews.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <svg className="w-12 h-12 text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-dark-400 text-lg font-medium">Sin reseñas</p>
            <p className="text-dark-500 text-sm mt-1">Todavía no hay reseñas de clientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="glass rounded-xl p-5 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {review.user.image ? (
                      <img src={review.user.image} alt={review.user.name || ''} className="w-10 h-10 rounded-full border-2 border-dark-700 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-dark-400 text-sm font-bold">{(review.user.name || '?')[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{review.user.name || 'Anónimo'}</span>
                        <span className="text-dark-600 text-xs">{review.user.email}</span>
                        <span className="text-dark-600 text-xs">•</span>
                        <span className="text-dark-500 text-xs">{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="flex text-gold-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-gold-400' : 'text-dark-700'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-dark-300 text-sm mt-2 leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    title="Eliminar reseña"
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
    </div>
  );
}
