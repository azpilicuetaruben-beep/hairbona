'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
  photo: string | null;
}

const serviceIcons: Record<string, string> = {
  'Corte de Pelo': '/icons/corte.jpg',
  'Perfilado de Cejas': '/icons/cejas.jpg',
  'Corte + Barba': '/icons/maquina.jpg',
  'Barba': '/icons/barba.jpg',
  'Shaving Tradicional': '/icons/shaving.jpg',
  'Color': '/icons/color.jpg',
};

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');
  const { data: session } = useSession();

  const [step, setStep] = useState(1); // 1: Service, 2: Barber, 3: Date&Time, 4: Info
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  }).filter((d) => d.getDay() !== 0); // Filter out Sundays

  useEffect(() => {
    const nocache = `?t=${Date.now()}`;
    Promise.all([
      fetch(`/api/services${nocache}`).then(res => res.json()),
      fetch(`/api/barbers${nocache}`).then(res => res.json())
    ]).then(([servicesData, barbersData]) => {
      setServices(servicesData);
      setBarbers(barbersData);
      
      if (preselectedService) {
        const found = servicesData.find((s: Service) => s.id === preselectedService);
        if (found) {
          setSelectedService(found);
          setStep(2);
        }
      }
    }).catch(() => {});
  }, [preselectedService]);

  const fetchSlots = useCallback(async (date: string, serviceId: string, barberId: string) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime('');
    try {
      const res = await fetch(
        `/api/availability?date=${date}&serviceId=${serviceId}&barberId=${barberId}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAvailableSlots(data);
    } catch {
      setAvailableSlots([]);
    }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    if (selectedDate && selectedService && selectedBarber) {
      fetchSlots(selectedDate, selectedService.id, selectedBarber.id);
    }
  }, [selectedDate, selectedService, selectedBarber, fetchSlots]);

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Por favor completá tu nombre y teléfono.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: session?.user?.email || null,
          date: selectedDate,
          startTime: selectedTime,
          serviceId: selectedService!.id,
          barberId: selectedBarber!.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear el turno');
      }
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el turno');
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${dayNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;
  };

  // Confirmed state
  if (confirmed) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
            ¡Turno Confirmado!
          </h2>
          <p className="text-dark-400 mb-6">
            Tu turno con <span className="text-gold-400 font-medium">{selectedBarber?.name}</span> para <span className="text-gold-400 font-medium">{selectedService?.name}</span> fue reservado con éxito.
          </p>
          <div className="glass rounded-2xl p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-dark-500">Servicio</span>
              <span className="text-white font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Barbero</span>
              <span className="text-white font-medium">{selectedBarber?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Fecha</span>
              <span className="text-white font-medium">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Hora</span>
              <span className="text-white font-medium">{selectedTime} hs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Duración</span>
              <span className="text-white font-medium">{selectedService?.duration} min</span>
            </div>
          </div>
          <Link
            href="/"
            className="btn-gold inline-block text-dark-950 px-8 py-3 rounded-full text-sm font-bold tracking-wider uppercase"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <nav className="glass py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Hairbona" className="h-8 w-auto rounded-full object-contain" />
            <span className="text-xl font-heading font-bold text-gold-gradient hidden sm:block">HAIRBONA</span>
          </Link>
          <Link
            href="/"
            className="text-dark-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s
                    ? 'bg-gold-500 text-dark-950'
                    : 'bg-dark-800 text-dark-500'
                }`}
              >
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 4 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 transition-all duration-300 ${
                    step > s ? 'bg-gold-500' : 'bg-dark-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white text-center mb-2">
              Elegí tu Servicio
            </h2>
            <p className="text-dark-400 text-center mb-8">
              Seleccioná el servicio que necesitás
            </p>

            <div className="space-y-3 stagger-children">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className="w-full glass rounded-xl p-5 text-left hover:glow-gold transition-all duration-300 hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={serviceIcons[service.name] || '/icons/corte.jpg'} 
                      alt={service.name} 
                      className="w-10 h-10 object-cover rounded-lg border border-gold-500/30 group-hover:border-gold-400 transition-colors"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-dark-500 text-sm mt-0.5">{service.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-dark-500 text-xs">{service.duration} min</span>
                      {service.price && (
                        <span className="text-gold-400 text-sm font-semibold">${service.price.toLocaleString()}</span>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-dark-600 group-hover:text-gold-400 transition-all group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => {
                setStep(1);
                setSelectedBarber(null);
              }}
              className="text-dark-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Cambiar servicio
            </button>

            <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
              <img 
                src={serviceIcons[selectedService?.name || ''] || '/icons/corte.jpg'} 
                alt="Service icon" 
                className="w-8 h-8 object-cover rounded border border-gold-500/30"
              />
              <div>
                <p className="text-white font-medium">{selectedService?.name}</p>
                <p className="text-dark-500 text-xs">{selectedService?.duration} min</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
              Elegí tu Barbero
            </h2>
            <p className="text-dark-400 mb-6">
              Seleccioná el profesional de tu preferencia
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarber(barber);
                    setStep(3);
                  }}
                  className="glass rounded-2xl p-4 text-center hover:glow-gold transition-all duration-300 hover:-translate-y-1 flex flex-col items-center group"
                >
                  <img src={barber.photo || 'https://i.pravatar.cc/150'} alt={barber.name} className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-dark-800 group-hover:border-gold-500 transition-colors" />
                  <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">{barber.name}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => {
                setStep(2);
                setSelectedDate('');
                setSelectedTime('');
              }}
              className="text-dark-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Cambiar barbero
            </button>

            <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={serviceIcons[selectedService?.name || ''] || '/icons/corte.jpg'} 
                  alt="Service icon" 
                  className="w-8 h-8 object-cover rounded border border-gold-500/30"
                />
                <div>
                  <p className="text-white font-medium">{selectedService?.name}</p>
                  <p className="text-dark-500 text-xs">{selectedService?.duration} min</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-dark-700"></div>
              <div className="flex items-center gap-3">
                <img src={selectedBarber?.photo || 'https://i.pravatar.cc/150'} alt={selectedBarber?.name} className="w-8 h-8 rounded-full object-cover" />
                <p className="text-white font-medium">{selectedBarber?.name}</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
              Elegí Fecha y Hora
            </h2>
            <p className="text-dark-400 mb-6">
              Seleccioná el día y horario que prefieras
            </p>

            {/* Date selector */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">
                Fecha
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {dates.map((d) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toDateString() === d.toDateString();
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-shrink-0 w-16 py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 ${
                        isSelected
                          ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                          : 'glass hover:bg-dark-800'
                      }`}
                    >
                      <span className={`text-[10px] font-medium uppercase ${isSelected ? 'text-dark-950/70' : 'text-dark-500'}`}>
                        {dayNames[d.getDay()]}
                      </span>
                      <span className={`text-lg font-bold ${isSelected ? 'text-dark-950' : 'text-white'}`}>
                        {d.getDate()}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-dark-950/70' : 'text-dark-500'}`}>
                        {isToday ? 'Hoy' : monthNames[d.getMonth()].substring(0, 3)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="animate-fade-in">
                <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">
                  Horario
                </h3>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="glass rounded-xl p-8 text-center">
                    <p className="text-dark-400">No hay horarios disponibles para este día.</p>
                    <p className="text-dark-500 text-sm mt-1">Probá con otro día.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedTime === slot
                            ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                            : 'glass hover:bg-dark-800 text-dark-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTime && (
              <div className="mt-8 animate-fade-in">
                <button
                  onClick={() => setStep(4)}
                  className="w-full btn-gold text-dark-950 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer Info */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setStep(3)}
              className="text-dark-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Cambiar horario
            </button>

            {/* Summary */}
            <div className="glass rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between border-b border-dark-800 pb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={serviceIcons[selectedService?.name || ''] || '/icons/corte.jpg'} 
                    alt="Service icon" 
                    className="w-8 h-8 object-cover rounded border border-gold-500/30"
                  />
                  <span className="text-white font-medium">{selectedService?.name}</span>
                </div>
                <div className="text-dark-400 text-sm">{selectedService?.duration} min</div>
              </div>
              <div className="flex items-center gap-3">
                <img src={selectedBarber?.photo || 'https://i.pravatar.cc/150'} alt={selectedBarber?.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-white font-medium text-sm">Con {selectedBarber?.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-dark-400 mt-2 bg-dark-900/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{selectedTime} hs</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
              Tus Datos
            </h2>
            <p className="text-dark-400 mb-6">
              Ingresá tu nombre y teléfono para confirmar el turno
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-dark-300 font-medium mb-1.5">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm text-dark-300 font-medium mb-1.5">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 2972-123456"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 btn-gold text-dark-950 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></div>
                  Reservando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar Turno
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
