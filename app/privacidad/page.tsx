import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | Hairbona',
  description: 'Política de privacidad de Hairbona. Información sobre cómo recopilamos y usamos tus datos.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="glass py-4 border-b border-dark-800/50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Hairbona" className="h-8 w-auto rounded-full" />
            <span className="text-xl font-heading font-bold text-gold-gradient">HAIRBONA</span>
          </Link>
          <Link href="/" className="text-dark-400 hover:text-white transition-colors text-sm">← Volver</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 text-dark-300 space-y-8">
        <div>
          <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Legal</span>
          <h1 className="text-4xl font-heading font-bold text-white mt-2">Política de Privacidad</h1>
          <p className="text-dark-500 mt-2 text-sm">Última actualización: septiembre de 2026</p>
        </div>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. ¿Quiénes somos?</h2>
            <p>Hairbona es una barbería ubicada en Coronel Suárez 185, Local 3, Junín de los Andes, Neuquén, Argentina. Esta política explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizás nuestro sitio web.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Información que recopilamos</h2>
            <p>Cuando iniciás sesión con tu cuenta de Google, recopilamos:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li>Nombre y apellido de tu cuenta de Google</li>
              <li>Dirección de correo electrónico</li>
              <li>Foto de perfil de Google</li>
            </ul>
            <p className="mt-3">Cuando reservás un turno (con o sin cuenta), recopilamos:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li>Nombre y apellido</li>
              <li>Número de teléfono de contacto</li>
              <li>Fecha, hora y servicio solicitado</li>
            </ul>
            <p className="mt-3">Cuando dejás una reseña, recopilamos:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li>El texto de tu reseña y calificación</li>
              <li>Tu nombre y foto de perfil (obtenidos de Google)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. ¿Para qué usamos tu información?</h2>
            <ul className="list-disc list-inside space-y-1 text-dark-400">
              <li>Gestionar y confirmar tus reservas de turnos</li>
              <li>Contactarte ante cambios en tu turno</li>
              <li>Llevar un historial de visitas para el programa de fidelidad</li>
              <li>Mostrar tus reseñas públicas en el sitio web</li>
              <li>Mejorar nuestros servicios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. ¿Compartimos tu información?</h2>
            <p>No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales. Tu información es utilizada exclusivamente por el equipo de Hairbona para gestionar los servicios descritos en esta política.</p>
            <p className="mt-2">Utilizamos los siguientes servicios de terceros que pueden procesar tu información:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li><strong className="text-white">Google OAuth</strong>: para la autenticación con cuenta de Google</li>
              <li><strong className="text-white">Vercel</strong>: para el alojamiento del sitio web</li>
              <li><strong className="text-white">Neon PostgreSQL</strong>: para el almacenamiento seguro de datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Retención de datos</h2>
            <p>Conservamos tu información mientras tengas una cuenta activa en nuestro sitio o mientras sea necesario para prestarte los servicios. Podés solicitar la eliminación de tus datos en cualquier momento contactándonos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Tus derechos</h2>
            <p>Tenés derecho a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li>Acceder a los datos personales que tenemos sobre vos</li>
              <li>Solicitar la corrección de datos incorrectos</li>
              <li>Solicitar la eliminación de tu cuenta y tus datos</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas apropiadas para proteger tu información personal contra accesos no autorizados, alteración, divulgación o destrucción.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contacto</h2>
            <p>Si tenés preguntas sobre esta política o querés ejercer tus derechos, podés contactarnos a través de nuestro Instagram: <a href="https://www.instagram.com/hairbona_fr" className="text-gold-400 hover:underline">@hairbona_fr</a></p>
          </section>
        </div>

        <div className="pt-6 border-t border-dark-800 flex gap-6 text-sm">
          <Link href="/terminos" className="text-gold-400 hover:underline">Términos y Condiciones</Link>
          <Link href="/" className="text-dark-500 hover:text-white">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
