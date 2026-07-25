import type { Metadata } from 'next'
import './globals.css'
import AuthGate from './auth-gate'

export const metadata: Metadata = {
  title: 'EDUOS MAROC — Plateforme de gestion des centres de formation',
  description: 'De l\'inscription jusqu\'à la certification, tout est piloté en temps réel. La solution e-learning pensée pour les centres de formation marocains.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body><AuthGate>{children}</AuthGate></body>
    </html>
  )
}
