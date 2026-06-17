'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfToday, isBefore } from 'date-fns'
import { de } from 'date-fns/locale'
import { CONFIG, TimeSlot } from '@/lib/types'

const DAYS_AHEAD = 14

export default function Home() {
  const today = startOfToday()
  const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i))

  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [duration, setDuration] = useState(1)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoadingSlots(true)
      setSelectedSlot(null)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(`/api/bookings?date=${dateStr}`)
      const data = await res.json()
      setSlots(data.slots || [])
      setLoadingSlots(false)
    }
    load()
  }, [selectedDate])

  const price = CONFIG.pricePerHour * duration

  const handleSubmit = async () => {
    if (!selectedSlot || !form.name || !form.email || !form.phone) {
      setError('Bitte alle Felder ausfüllen.')
      return
    }
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        date: format(selectedDate, 'yyyy-MM-dd'),
        slot: selectedSlot,
        duration,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error || 'Fehler beim Buchen. Bitte nochmal versuchen.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="hero-tag">⚽ Online Buchung</div>
        <h1>
          Dein <span>Feld</span><br />deine Zeit
        </h1>
        <p className="hero-sub">Slot wählen · Online bezahlen · Loskicken</p>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-number">{CONFIG.pricePerHour}€</div>
            <div className="stat-label">pro Stunde</div>
          </div>
          <div className="stat">
            <div className="stat-number">8–22</div>
            <div className="stat-label">Öffnungszeiten</div>
          </div>
          <div className="stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Flutlicht</div>
          </div>
        </div>
      </div>

      {/* BOOKING */}
      <div className="booking-section">
        <div className="container">

          {/* Datum wählen */}
          <div className="section-header">
            <h2>Datum wählen</h2>
            <p>Die nächsten {DAYS_AHEAD} Tage verfügbar</p>
          </div>

          <div className="date-grid">
            {dates.map(date => {
              const isPast = isBefore(date, today) && date.toDateString() !== today.toDateString()
              const isSelected = date.toDateString() === selectedDate.toDateString()
              return (
                <button
                  key={date.toISOString()}
                  className={`date-btn ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                >
                  <div className="date-day">{format(date, 'EEE', { locale: de })}</div>
                  <div className="date-num">{format(date, 'd')}</div>
                </button>
              )
            })}
          </div>

          {/* Zeit wählen */}
          <div className="section-header">
            <h2>Uhrzeit wählen</h2>
            <p>
              {format(selectedDate, 'EEEE, d. MMMM', { locale: de })} · 
              Durchgestrichen = belegt
            </p>
          </div>

          {loadingSlots ? (
            <div className="loading">Lade verfügbare Zeiten…</div>
          ) : (
            <div className="slots-grid">
              {slots.map(slot => (
                <button
                  key={slot.time}
                  className={`slot-btn ${selectedSlot === slot.time ? 'selected' : ''}`}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          {/* Buchungsformular */}
          {selectedSlot && (
            <div className="booking-form">
              <h3>Buchung abschließen</h3>

              <div className="form-group">
                <label>Dauer</label>
                <select
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                >
                  <option value={1}>1 Stunde</option>
                  <option value={2}>2 Stunden</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dein Name</label>
                  <input
                    type="text"
                    placeholder="Max Mustermann"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    placeholder="+49 170 1234567"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>E-Mail (für Bestätigung)</label>
                <input
                  type="email"
                  placeholder="max@beispiel.de"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>Datum</span>
                  <span>{format(selectedDate, 'dd.MM.yyyy')}</span>
                </div>
                <div className="summary-row">
                  <span>Uhrzeit</span>
                  <span>{selectedSlot} Uhr</span>
                </div>
                <div className="summary-row">
                  <span>Dauer</span>
                  <span>{duration} Std.</span>
                </div>
                <div className="summary-row total">
                  <span>Gesamt</span>
                  <span>{price},00 €</span>
                </div>
              </div>

              {error && (
                <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{error}</p>
              )}

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Weiterleitung…' : `Jetzt buchen & ${price}€ zahlen`}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
