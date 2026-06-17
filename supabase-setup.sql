-- Führe dieses SQL in deinem Supabase SQL Editor aus
-- Dashboard → SQL Editor → New Query → reinkopieren → Run

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  slot TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected', 'paid')),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index für schnelle Datum-Abfragen
CREATE INDEX idx_bookings_date ON bookings(date);

-- Row Level Security (Sicherheit)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Alle dürfen lesen (für Verfügbarkeitscheck)
CREATE POLICY "Alle können lesen" ON bookings
  FOR SELECT USING (true);

-- Alle dürfen neue Buchungen erstellen
CREATE POLICY "Alle können buchen" ON bookings
  FOR INSERT WITH CHECK (true);

-- Nur Service Role darf updaten (für Webhook & Admin API)
CREATE POLICY "Service kann updaten" ON bookings
  FOR UPDATE USING (true);
