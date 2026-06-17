# ⚽ Fußballfeld Buchungssystem

Komplettes Buchungssystem mit Online-Zahlung für einen Fußballplatz.

---

## Was ist enthalten?

- **Buchungsseite** – Datum & Zeit wählen, online bezahlen mit Karte
- **Admin-Panel** unter `/admin` – Buchungen bestätigen oder ablehnen
- **Automatisch** – Stripe markiert Buchungen als bezahlt nach Zahlung

---

## Schritt-für-Schritt Anleitung

### 1. Supabase einrichten (Datenbank)

1. Gehe zu [supabase.com](https://supabase.com) → neues Projekt erstellen
2. Warte bis das Projekt fertig ist (~1 Min)
3. Klicke links auf **SQL Editor** → **New Query**
4. Kopiere den Inhalt von `supabase-setup.sql` rein → **Run**
5. Gehe zu **Settings → API** und kopiere:
   - `Project URL` → das ist dein `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` Key → das ist dein `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Stripe einrichten (Zahlung)

1. Gehe zu [stripe.com](https://stripe.com) → Account erstellen
2. Gehe zu **Developers → API Keys**
3. Kopiere:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
4. Den `STRIPE_WEBHOOK_SECRET` bekommst du später (nach dem Deployen)

### 3. Auf Vercel deployen

1. Gehe zu [github.com](https://github.com) → neues Repository erstellen → alle Dateien hochladen
2. Gehe zu [vercel.com](https://vercel.com) → **Add New Project**
3. Verbinde dein GitHub Repository
4. Bei **Environment Variables** alle Werte aus `.env.local.example` eintragen
5. Für `ADMIN_PASSWORD` such dir ein sicheres Passwort aus
6. Für `NEXT_PUBLIC_BASE_URL` trag deine Vercel URL ein (bekommst du nach dem ersten Deploy)
7. **Deploy** klicken!

### 4. Stripe Webhook einrichten (damit Zahlungen ankommen)

1. In Stripe → **Developers → Webhooks** → **Add endpoint**
2. URL: `https://DEINE-VERCEL-URL.vercel.app/api/webhook`
3. Event auswählen: `checkout.session.completed`
4. Nach dem Speichern: **Signing secret** kopieren → das ist `STRIPE_WEBHOOK_SECRET`
5. In Vercel → dein Projekt → **Settings → Environment Variables** → `STRIPE_WEBHOOK_SECRET` eintragen
6. Vercel neu deployen (Redeploy klicken)

---

## Konfiguration anpassen

In `lib/types.ts` kannst du alles anpassen:

```typescript
export const CONFIG = {
  fieldName: 'Sportpark Arena',   // Name des Platzes
  pricePerHour: 25,               // Preis in EUR
  openHour: 8,                    // Öffnung (8 = 08:00)
  closeHour: 22,                  // Schließung (22 = 22:00)
}
```

---

## Admin-Panel

Erreichbar unter: `https://deine-url.vercel.app/admin`

- Passwort = das was du als `ADMIN_PASSWORD` eingetragen hast
- Bezahlte Buchungen erscheinen oben → Bestätigen oder Ablehnen
- Übersicht aller Buchungen nach Status sortiert

---

## Live schalten (Stripe)

Wenn alles funktioniert, musst du in Stripe von **Test Mode** auf **Live Mode** wechseln und neue API Keys verwenden. Im Test Mode kannst du mit der Karte `4242 4242 4242 4242` (beliebiges Datum, beliebiger CVC) testen.
