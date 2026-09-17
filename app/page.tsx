'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number | null;
}

interface Barber {
  id: string;
  name: string;
  description: string;
  photo: string | null;
  whatsapp: string | null;
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
}

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

const serviceIcons: Record<string, string> = {
  'Corte de Pelo': '/icons/corte.jpg',
  'Perfilado de Cejas': '/icons/cejas.jpg',
  'Corte + Barba': '/icons/maquina.jpg',
  'Barba': '/icons/barba.jpg',
  'Shaving Tradicional': '/icons/shaving.jpg',
  'Color': '/icons/color.jpg',
};

const INSTAGRAM_URL = 'https://www.instagram.com/hairbona_fr?stkn=MTR4aHp6Zjg0bzdoMg==';

export default function HomePage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Review form state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/barbers').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
      fetch('/api/reviews').then(r => r.json()),
    ]).then(([servicesData, barbersData, galleryData, configData, reviewsData]) => {
      setServices(servicesData);
      setBarbers(barbersData);
      setGallery(galleryData);
      setConfig(configData);
      setReviews(reviewsData);
    }).catch(console.error);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroImage = config['heroImage'] || '/images/hero_background.jpg';
  const heroSubtitle = config['heroSubtitle'] || 'Tu barbería de confianza. Estilo, precisión y atención personalizada en cada visita.';
  const whatsappNumber = config['whatsappNumber'] || '+5491100000000';

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, text: reviewText }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setReviewText('');
        setReviewRating(5);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al enviar la reseña');
      }
    } catch {
      alert('Error al enviar la reseña');
    }
    setSubmittingReview(false);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass py-2 shadow-lg shadow-black/30'
            : 'bg-transparent py-3 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src="/images/logo.jpg" alt="Hairbona Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full shadow-lg border-2 border-gold-500/50 group-hover:border-gold-400 transition-all group-hover:scale-105" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#servicios" className="text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Servicios</a>
            <a href="#nosotros" className="text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Nosotros</a>
            <a href="#galeria" className="text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Galería</a>
            <a href="#resenas" className="text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Reseñas</a>
            <a href="#ubicacion" className="text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Ubicación</a>
            <Link href="/reservar" className="btn-gold text-dark-950 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide uppercase">
              Reservar Turno
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-dark-300 hover:text-gold-400 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-4 animate-fade-in">
            <a href="#servicios" onClick={() => setMenuOpen(false)} className="block py-3 text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Servicios</a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)} className="block py-3 text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Nosotros</a>
            <a href="#galeria" onClick={() => setMenuOpen(false)} className="block py-3 text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Galería</a>
            <a href="#resenas" onClick={() => setMenuOpen(false)} className="block py-3 text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Reseñas</a>
            <a href="#ubicacion" onClick={() => setMenuOpen(false)} className="block py-3 text-dark-300 hover:text-gold-400 transition-colors text-sm font-medium tracking-wide uppercase">Ubicación</a>
            <Link href="/reservar" className="block mt-2 btn-gold text-dark-950 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide uppercase text-center">
              Reservar Turno
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Barbershop interior" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              <span className="text-dark-300 text-xs sm:text-sm font-medium tracking-wider uppercase">
                Junín de los Andes, Neuquén
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-heading font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <span className="text-gold-gradient">HAIR</span>
            <span className="text-white">BONA</span>
          </h1>

          <p className="text-dark-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-in-up px-2" style={{ animationDelay: '0.3s' }}>
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <Link href="/reservar" className="btn-gold text-dark-950 px-8 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-2 animate-pulse-gold w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservar Turno
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-16 sm:py-24 lg:py-32 relative z-10 bg-dark-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Nuestros</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">Servicios</h2>
            <div className="mt-4 mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
            {services.map((service) => (
              <Link key={service.id} href={`/reservar?service=${service.id}`} className="group glass rounded-2xl p-5 sm:p-6 hover:glow-gold transition-all duration-500 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <img 
                      src={serviceIcons[service.name] || '/icons/corte.jpg'} 
                      alt={service.name} 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gold-500/30 group-hover:border-gold-400 transition-colors"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-base sm:text-lg font-heading font-semibold group-hover:text-gold-400 transition-colors">{service.name}</h3>
                    <p className="text-dark-400 text-sm mt-1 leading-relaxed line-clamp-2">{service.description}</p>
                    {service.price && (
                      <div className="mt-3">
                        <span className="text-gold-400 text-lg sm:text-xl font-bold">${service.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nosotros (Barberos) */}
      <section id="nosotros" className="py-16 sm:py-24 lg:py-32 relative z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Los Profesionales</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">Sobre Nosotros</h2>
            <div className="mt-4 mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {barbers.map((barber) => (
              <div key={barber.id} className="glass rounded-3xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-500">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={barber.photo || 'https://i.pravatar.cc/400'} 
                    alt={barber.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent"></div>
                </div>
                <div className="p-5 sm:p-6 relative -mt-10 z-10 flex flex-col flex-1">
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-gold-400 mb-2">{barber.name}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed mb-4 sm:mb-6 flex-1">{barber.description}</p>
                  
                  {barber.whatsapp && (
                    <a 
                      href={`https://wa.me/${barber.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#1ebd5b] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors w-full mt-auto text-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Hablar con {barber.name}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería Section */}
      <section id="galeria" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Nuestro Arte</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">Galería</h2>
            <div className="mt-4 mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-2 sm:p-8 relative">
            {gallery.slice(0, 12).map((img, index) => {
              const rotation = (index % 2 === 0 ? 1 : -1) * (2 + (index % 5));
              return (
                <div 
                  key={img.id}
                  className="gallery-photo cursor-pointer relative aspect-square bg-dark-900 rounded-lg p-1.5 sm:p-2 border border-dark-800"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  onClick={() => setLightboxImg(img.url)}
                >
                  <img src={img.url} alt={img.caption || 'Hairbona Gallery'} className="w-full h-full object-cover rounded shadow-inner" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox for Gallery */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="Gallery view" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-gold-400 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Reseñas Section */}
      <section id="resenas" className="py-16 sm:py-24 bg-dark-900 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Lo que dicen</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">Nuestros Clientes</h2>
            <div className="mt-4 mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
          </div>

          {/* Leave a review */}
          <div className="glass rounded-2xl p-5 sm:p-8 mb-8 sm:mb-12 max-w-2xl mx-auto">
            {session ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {session.user?.image && (
                    <img src={session.user.image} alt={session.user.name || ''} className="w-10 h-10 rounded-full border-2 border-dark-700" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{session.user?.name}</p>
                    <p className="text-dark-500 text-xs">Dejá tu reseña</p>
                  </div>
                </div>

                {/* Star rating selector */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          star <= (hoverRating || reviewRating) ? 'text-gold-400' : 'text-dark-700'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Contanos tu experiencia en Hairbona..."
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none text-sm"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={submitReview}
                    disabled={submittingReview || !reviewText.trim()}
                    className="btn-gold text-dark-950 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      'Publicar Reseña'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-dark-400 text-sm mb-4">Iniciá sesión con Google para dejar tu reseña</p>
                <button
                  onClick={() => signIn('google')}
                  className="inline-flex items-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors text-sm shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Iniciar sesión con Google
                </button>
              </div>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-dark-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-dark-500 text-base sm:text-lg font-medium">Aún no hay reseñas</p>
              <p className="text-dark-600 text-sm mt-1">¡Sé el primero en contar tu experiencia!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="glass p-5 sm:p-8 rounded-2xl relative">
                  <div className="flex text-gold-400 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${i < review.rating ? 'text-gold-400' : 'text-dark-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-dark-300 italic mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {review.user.image ? (
                      <img src={review.user.image} alt={review.user.name || ''} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dark-700" />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-dark-700 flex items-center justify-center">
                        <span className="text-dark-400 font-bold">{(review.user.name || '?')[0]}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-white font-medium text-sm">{review.user.name || 'Anónimo'}</span>
                      <p className="text-dark-500 text-xs mt-0.5">{new Date(review.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section id="ubicacion" className="py-16 sm:py-24 lg:py-32 relative bg-dark-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Dónde estamos</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">Ubicación</h2>
            <div className="mt-4 mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-white text-lg sm:text-xl font-heading font-semibold mb-5 sm:mb-6">Encontranos en</h3>
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Dirección</p>
                      <p className="text-dark-400 text-xs sm:text-sm mt-0.5">Coronel Suárez 185, Local 3<br />Junín de los Andes, Neuquén<br />Argentina</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Horarios</p>
                      <p className="text-dark-400 text-xs sm:text-sm mt-0.5">Lunes a Sábados<br />09:00 - 13:00 | 15:00 - 20:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/reservar" className="btn-gold mt-6 sm:mt-8 text-dark-950 px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Reservar Turno
              </Link>
            </div>

            <div className="glass rounded-2xl overflow-hidden h-[300px] sm:h-[400px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.262529729864!2d-71.07727402359404!3d-39.95786446862569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9610f9da3721345d%3A0xe54ef99dfccbb887!2sCoronel%20Su%C3%A1rez%20185%2C%20Q8371%20Jun%C3%ADn%20de%20los%20Andes%2C%20Neuqu%C3%A9n!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Hairbona"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 animate-fade-in-up flex items-center justify-center group"
      >
        <span className="absolute right-full mr-3 sm:mr-4 bg-dark-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
          ¿Dudas? Escribinos
        </span>
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-6 sm:py-8 relative z-10 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
              <span className="text-xl font-heading font-bold text-gold-gradient group-hover:opacity-80 transition-opacity">
                HAIRBONA
              </span>
              <svg className="w-5 h-5 text-dark-500 group-hover:text-gold-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <p className="text-dark-500 text-xs sm:text-sm text-center sm:text-right">
              © {new Date().getFullYear()} Hairbona. Junín de los Andes, Neuquén.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
