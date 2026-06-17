export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'paid'

export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string        // YYYY-MM-DD
  slot: string        // e.g. "18:00"
  duration: number    // 1 or 2 hours
  price: number       // in EUR
  status: BookingStatus
  stripe_session_id?: string
  created_at: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

// Konfiguration – hier kannst du Zeiten und Preise anpassen
export const CONFIG = {
  fieldName: 'Sportpark Arena',
  currency: 'eur',
  pricePerHour: 25, // EUR
  openHour: 8,
  closeHour: 22,
  slotDurationMinutes: 60,
}
