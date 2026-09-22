import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The email address that will SEND the notifications (Must be verified in Resend, usually onboarding@resend.dev for testing or a custom domain)
const FROM_EMAIL = 'onboarding@resend.dev'; 
// The email address that will RECEIVE the notifications (The barber/owner)
const TO_EMAIL = process.env.OWNER_EMAIL || 'tucorreo@gmail.com'; 

export async function sendNotificationEmail(subject: string, htmlBody: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY no está configurada. No se envió el email.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Hairbona <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error('Error enviando email con Resend:', error);
    }
  } catch (err) {
    console.error('Excepción al enviar email:', err);
  }
}
