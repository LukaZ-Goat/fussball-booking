import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendConfirmationEmail, sendRejectionEmail } from '@/lib/emails'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function isAdmin(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  return pwd === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 401 })

  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('slot', { ascending: true })

  return NextResponse.json({ bookings: data })
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Fehlende Daten' }, { status: 400 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 })

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update fehlgeschlagen' }, { status: 500 })

  if (status === 'confirmed') {
    await sendConfirmationEmail(booking).catch(console.error)
  }

  if (status === 'rejected') {
    if (booking.stripe_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id)
        if (session.payment_intent) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          })
        }
      } catch (e) {
        console.error('Rückerstattung fehlgeschlagen:', e)
      }
    }
    await sendRejectionEmail(booking).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
