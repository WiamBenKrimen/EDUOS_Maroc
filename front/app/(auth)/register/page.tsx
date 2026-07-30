'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <Link href="/" className="auth-logo">
          <Image src="/images/logo.png" alt="EDUOS MAROC" width={220} height={70} style={{ height: 62, width: 'auto', objectFit: 'contain' }} priority />
        </Link>

        <div style={{ width: 52, height: 52, margin: '4px auto 18px', display: 'grid', placeItems: 'center', borderRadius: 14, background: '#EBF0FA', color: '#1B3A6B', fontSize: 24, fontWeight: 800 }}>✓</div>
        <h1 className="auth-heading">Compte sur invitation</h1>
        <p className="auth-sub" style={{ lineHeight: 1.65 }}>
          Les comptes EDUOS ne sont pas créés librement. Cette organisation protège les données de chaque centre et garantit le bon niveau d’accès.
        </p>

        <div style={{ display: 'grid', gap: 12, margin: '24px 0', textAlign: 'left' }}>
          {[
            ['Vous représentez un centre', 'Envoyez une candidature. Après validation, l’administrateur crée le compte du directeur.'],
            ['Vous faites partie d’une équipe', 'Le directeur de votre centre crée votre compte et choisit votre rôle.'],
            ['Vous êtes participant', 'Votre accès est créé par la direction de votre centre lors de votre inscription.'],
          ].map(([title, text], index) => (
            <div key={title} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 10, padding: 14, border: '1px solid #E2E8F0', borderRadius: 12, background: '#F8FAFC' }}>
              <span style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', borderRadius: 8, background: '#1B3A6B', color: '#fff', fontSize: 12, fontWeight: 800 }}>{index + 1}</span>
              <span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{title}</strong><small style={{ display: 'block', color: '#64748B', lineHeight: 1.5, marginTop: 3 }}>{text}</small></span>
            </div>
          ))}
        </div>

        <Link href="/" className="auth-submit" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Candidater mon centre</Link>
        <p className="auth-switch">Vous avez reçu vos accès ? <Link href="/login">Se connecter</Link></p>
      </div>
    </div>
  )
}
