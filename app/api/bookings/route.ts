import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/lib/types'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
// GET /api/bookings?date=2024-06-15
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Kein Datum angegeben' }, { status: 400 })

  const { data: bookings } = await supabase
    .from('bookings')
    .select('slot, duration')
    .eq('date', date)
    .in('status', ['pending', 'confirmed', 'paid'])

  // Alle möglichen Slots für den Tag generieren
  const slots = []
  for (let h = CONFIG.openHour; h < CONFIG.closeHour; h++) {
    const time = `${String(h).padStart(2, '0')}:00`
    const isBooked = bookings?.some(b => {
      const bookedHour = parseInt(b.slot.split(':')[0])
      return h >= bookedHour && h < bookedHour + b.duration
    })
    slots.push({ time, available: !isBooked })
  }

  return NextResponse.json({ slots })
}

// POST /api/bookings  – erstellt Stripe Checkout Session
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, date, slot, duration } = body

  if (!name || !email || !phone || !date || !slot || !duration) {
    return NextResponse.json({ error: 'Alle Felder ausfüllen' }, { status: 400 })
  }

  const price = CONFIG.pricePerHour * duration

  // Buchung als "pending" in DB speichern
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ name, email, phone, date, slot, duration, price, status: 'pending' })
    .select()
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Buchung konnte nicht gespeichert werden' }, { status: 500 })
  }

  // Stripe Checkout erstellen
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: CONFIG.currency,
        product_data: {
          name: `${CONFIG.fieldName} – ${date} um ${slot} Uhr`,
          description: `${duration} Stunde${duration > 1 ? 'n' : ''} Fußballfeld`,
        },
        unit_amount: price * 100, // Stripe erwartet Cent
      },
      quantity: 1,
    }],
    mode: 'payment',
    customer_email: email,
    metadata: { booking_id: booking.id },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-success?id=${booking.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
  })

  // Session ID in Booking speichern
  await supabase
    .from('bookings')
    .update({ stripe_session_id: session.id })
    .eq('id', booking.id)

  return NextResponse.json({ url: session.url })
}
