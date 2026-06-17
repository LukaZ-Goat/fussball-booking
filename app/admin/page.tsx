'use client'

import { useState, useEffect } from 'react'
import { Booking } from '@/lib/types'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async (pwd: string) => {
    setLoading(true)
    const res = await fetch('/api/admin', {
      headers: { 'x-admin-password': pwd }
    })
    if (res.status === 401) {
      setError('Falsches Passwort')
      setLoading(false)
      return
    }
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoggedIn(true)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ id, status }),
    })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b))
  }

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      confirmed: 'Bestätigt',
      rejected: 'Abgelehnt',
    }
    return map[s] || s
  }

  if (!loggedIn) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 32, marginBottom: 24, textTransform: 'uppercase' }}>
            Admin Login
          </h2>
          <div className="form-group">
            <label>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load(password)}
              placeholder="••••••••"
            />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
          <button className="btn-primary" onClick={() => load(password)} disabled={loading}>
            {loading ? 'Lädt…' : 'Einloggen'}
          </button>
        </div>
      </div>
    )
  }

  const groups = {
    paid: bookings.filter(b => b.status === 'paid'),
    pending: bookings.filter(b => b.status === 'pending'),
    confirmed: bookings.filter(b => b.status === 'confirmed'),
    rejected: bookings.filter(b => b.status === 'rejected'),
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 48, marginBottom: 8, textTransform: 'uppercase' }}>
          Buchungsübersicht
        </h1>
        <p style={{ color: 'var(--gray)', marginBottom: 36 }}>
          {bookings.length} Buchungen insgesamt · {groups.paid.length} bezahlt
        </p>

        {/* Neue Buchungen die bezahlt sind */}
        {groups.paid.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12, color: 'var(--green-bright)' }}>
              ✅ Bezahlt – Aktion nötig
            </h2>
            {groups.paid.map(b => (
              <BookingCard key={b.id} booking={b} statusLabel={statusLabel} onUpdate={updateStatus} showActions />
            ))}
          </section>
        )}

        {/* Pending (noch nicht bezahlt) */}
        {groups.pending.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12, color: 'var(--yellow)' }}>
              ⏳ Ausstehend (nicht bezahlt)
            </h2>
            {groups.pending.map(b => (
              <BookingCard key={b.id} booking={b} statusLabel={statusLabel} onUpdate={updateStatus} />
            ))}
          </section>
        )}

        {/* Bestätigt */}
        {groups.confirmed.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>Bestätigt</h2>
            {groups.confirmed.map(b => (
              <BookingCard key={b.id} booking={b} statusLabel={statusLabel} onUpdate={updateStatus} />
            ))}
          </section>
        )}

        {/* Abgelehnt */}
        {groups.rejected.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12, color: 'var(--red)' }}>Abgelehnt</h2>
            {groups.rejected.map(b => (
              <BookingCard key={b.id} booking={b} statusLabel={statusLabel} onUpdate={updateStatus} />
            ))}
          </section>
        )}

        {bookings.length === 0 && (
          <div className="loading">Noch keine Buchungen.</div>
        )}
      </div>
    </div>
  )
}

function BookingCard({
  booking: b,
  statusLabel,
  onUpdate,
  showActions,
}: {
  booking: Booking
  statusLabel: (s: string) => string
  onUpdate: (id: string, status: string) => void
  showActions?: boolean
}) {
  return (
    <div className="booking-card">
      <div className="booking-info">
        <div className="booking-name">{b.name}</div>
        <div className="booking-details">
          {b.date} · {b.slot} Uhr · {b.duration}h · {b.price}€
        </div>
        <div className="booking-details">{b.email} · {b.phone}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={`status-badge status-${b.status}`}>
          {statusLabel(b.status)}
        </span>
        {showActions && (
          <div className="booking-actions">
            <button className="btn-confirm" onClick={() => onUpdate(b.id, 'confirmed')}>
              Bestätigen
            </button>
            <button className="btn-reject" onClick={() => onUpdate(b.id, 'rejected')}>
              Ablehnen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
