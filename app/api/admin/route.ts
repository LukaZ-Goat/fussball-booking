import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Einfacher Passwort-Check für den Admin
function isAdmin(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  return pwd === process.env.ADMIN_PASSWORD
}

// GET /api/admin – alle Buchungen laden
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 401 })

  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('slot', { ascending: true })

  return NextResponse.json({ bookings: data })
}

// PATCH /api/admin – Status einer Buchung ändern
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Fehlende Daten' }, { status: 400 })

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update fehlgeschlagen' }, { status: 500 })
  return NextResponse.json({ success: true })
}
