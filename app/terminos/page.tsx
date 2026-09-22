import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones | Hairbona',
  description: 'Términos y condiciones del servicio de Hairbona.',
};

export default function TerminosPage() {
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
          <h1 className="text-4xl font-heading font-bold text-white mt-2">Términos y Condiciones</h1>
          <p className="text-dark-500 mt-2 text-sm">Última actualización: septiembre de 2026</p>
        </div>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los términos</h2>
            <p>Al acceder y utilizar el sitio web de Hairbona, aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debés utilizar este sitio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Servicio de reservas</h2>
            <p>El sistema de turnos en línea permite reservar citas en Hairbona. Al realizar una reserva:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li>Te comprometés a asistir en el horario acordado</li>
              <li>En caso de no poder asistir, se solicita cancelar con al menos 2 horas de anticipación</li>
              <li>Hairbona se reserva el derecho de cancelar o reprogramar turnos ante imprevistos, notificando al cliente</li>
              <li>Los precios publicados están sujetos a cambios sin previo aviso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Inicio de sesión con Google</h2>
            <p>Al usar &quot;Iniciar sesión con Google&quot;, autorizás a Hairbona a acceder a tu nombre, correo electrónico y foto de perfil de Google para identificarte dentro de la plataforma. No accedemos a ningún otro dato de tu cuenta de Google.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Programa de fidelidad</h2>
            <p>El programa de fidelidad es un beneficio adicional gratuito. Las visitas se registran automáticamente cuando un turno es marcado como completado por el equipo de Hairbona. Las recompensas son determinadas por Hairbona y pueden cambiar en cualquier momento. No tienen valor económico transferible.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Reseñas</h2>
            <p>Al dejar una reseña en el sitio:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-dark-400">
              <li>Garantizás que el contenido es verídico y basado en tu experiencia real</li>
              <li>No podés publicar contenido ofensivo, discriminatorio o falso</li>
              <li>Hairbona se reserva el derecho de eliminar reseñas que violen estas condiciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Propiedad intelectual</h2>
            <p>Todo el contenido de este sitio web (logotipos, imágenes, textos, diseño) es propiedad de Hairbona. No está permitida su reproducción sin autorización expresa.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitación de responsabilidad</h2>
            <p>Hairbona no se hace responsable por inconvenientes técnicos del sistema de reservas, pérdidas de datos por factores externos, ni por daños derivados del mal uso del sitio. Hacemos nuestro mejor esfuerzo para mantener el sistema funcionando correctamente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Modificaciones</h2>
            <p>Hairbona se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigencia al ser publicados en este sitio. Se recomienda revisar esta página periódicamente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será sometida a la jurisdicción de los tribunales de la Provincia de Neuquén.</p>
          </section>
        </div>

        <div className="pt-6 border-t border-dark-800 flex gap-6 text-sm">
          <Link href="/privacidad" className="text-gold-400 hover:underline">Política de Privacidad</Link>
          <Link href="/" className="text-dark-500 hover:text-white">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
