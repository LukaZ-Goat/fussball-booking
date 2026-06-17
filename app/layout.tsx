import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sportpark Arena – Fußballfeld buchen',
  description: 'Einfach online buchen, sofort bezahlen, loskicken.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
