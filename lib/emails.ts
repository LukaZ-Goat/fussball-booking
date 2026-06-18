import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!
const FIELD_NAME = 'Sportpark Arena'

// E-Mail an Inhaber: Neue Buchung eingegangen
export async function sendNewBookingEmail(booking: {
  id: string
  name: string
  email: string
  phone: string
  date: string
  slot: string
  duration: number
  price: number
}) {
  await resend.emails.send({
    from: 'Buchungssystem <onboarding@resend.dev>',
    to: ADMIN_EMAIL,
    subject: `⚽ Neue Buchung: ${booking.name} – ${booking.date} um ${booking.slot} Uhr`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a7a3c; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚽ Neue Buchung eingegangen!</h1>
        </div>
        <div style="background: #f5f5f5; padding: 24px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">Name</td><td style="padding: 8px 0; font-weight: bold;">${booking.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Datum</td><td style="padding: 8px 0; font-weight: bold;">${booking.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Uhrzeit</td><td style="padding: 8px 0; font-weight: bold;">${booking.slot} Uhr</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Dauer</td><td style="padding: 8px 0; font-weight: bold;">${booking.duration} Stunde${booking.duration > 1 ? 'n' : ''}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Betrag</td><td style="padding: 8px 0; font-weight: bold;">${booking.price}€</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">E-Mail</td><td style="padding: 8px 0;">${booking.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Telefon</td><td style="padding: 8px 0;">${booking.phone}</td></tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${BASE_URL}/admin" 
               style="background: #1a7a3c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              → Admin-Panel öffnen
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
            Buchung bestätigen oder ablehnen im Admin-Panel
          </p>
        </div>
      </div>
    `,
  })
}

// E-Mail an Kunde: Buchung bestätigt
export async function sendConfirmationEmail(booking: {
  name: string
  email: string
  date: string
  slot: string
  duration: number
  price: number
}) {
  await resend.emails.send({
    from: 'Buchungssystem <onboarding@resend.dev>',
    to: booking.email,
    subject: `✅ Buchung bestätigt – ${booking.date} um ${booking.slot} Uhr`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a7a3c; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Deine Buchung ist bestätigt!</h1>
        </div>
        <div style="background: #f5f5f5; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Hallo ${booking.name},</p>
          <p>deine Buchung bei <strong>${FIELD_NAME}</strong> wurde bestätigt. Wir freuen uns auf dich!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #666;">Datum</td><td style="padding: 8px 0; font-weight: bold;">${booking.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Uhrzeit</td><td style="padding: 8px 0; font-weight: bold;">${booking.slot} Uhr</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Dauer</td><td style="padding: 8px 0; font-weight: bold;">${booking.duration} Stunde${booking.duration > 1 ? 'n' : ''}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Betrag</td><td style="padding: 8px 0; font-weight: bold;">${booking.price}€ (bereits bezahlt)</td></tr>
          </table>
          <p style="color: #1a7a3c; font-weight: bold; font-size: 18px;">⚽ Viel Spaß beim Spielen!</p>
        </div>
      </div>
    `,
  })
}

// E-Mail an Kunde: Buchung abgelehnt + Rückerstattung
export async function sendRejectionEmail(booking: {
  name: string
  email: string
  date: string
  slot: string
  price: number
}) {
  await resend.emails.send({
    from: 'Buchungssystem <onboarding@resend.dev>',
    to: booking.email,
    subject: `❌ Buchung abgelehnt – ${booking.date} um ${booking.slot} Uhr`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c0392b; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">❌ Buchung leider abgelehnt</h1>
        </div>
        <div style="background: #f5f5f5; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Hallo ${booking.name},</p>
          <p>leider können wir deine Buchung für den <strong>${booking.date} um ${booking.slot} Uhr</strong> nicht annehmen.</p>
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">💰 Rückerstattung: ${booking.price}€</p>
            <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Der Betrag wird innerhalb von 5-10 Werktagen auf dein Konto zurückgebucht.</p>
          </div>
          <p>Wir entschuldigen uns für die Unannehmlichkeiten und hoffen, dich bald begrüßen zu dürfen!</p>
        </div>
      </div>
    `,
  })
}
