'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { homeForRole, login } from '../../../lib/auth'

const DEMO_ACCOUNTS = [
  { label: 'Direction', email: 'directeur@eduos.ma', color: '#1B3A6B' },
  { label: 'Opérateur', email: 'operateur@eduos.ma', color: '#059669' },
  { label: 'Participant', email: 'participant@eduos.ma', color: '#C9922A' },
  { label: 'Admin', email: 'admin@eduos.ma', color: '#7C3AED' },
]

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = login(email, password)
      const next = searchParams.get('next')
      window.location.assign(next?.startsWith(`/${user.role}`) && next ? next : homeForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects.')
      setLoading(false)
    }
  }

  function useDemo(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('demo1234')
  }

  function handleForgotSubmit(e: FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotSent(true)
  }

  return (
    <div className="auth-page auth-login-page">
      <header className="auth-navbar">
        <Link href="/" className="auth-nav-brand" aria-label="EDUOS Maroc - Accueil">
          <Image src="/images/logo.png" alt="EDUOS MAROC" width={210} height={68} priority />
        </Link>
        <Link href="/" className="auth-home-link">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /><path d="M9 12h11" /></svg>
          Retour à l'accueil
        </Link>
      </header>
      <main className="auth-login-main">
      <div className="auth-card auth-login-card">
        <Link href="/" className="auth-logo">
          <Image
            src="/images/logo.png"
            alt="EDUOS MAROC"
            width={300}
            height={96}
            style={{ height: 80, width: 'auto', objectFit: 'contain' }}
            priority
          />
        </Link>

        <h1 className="auth-heading">Espace Connexion</h1>
        <p className="auth-sub">Plateforme de gestion pour les centres de formation au Maroc.</p>

        <form onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email" type="email" value={email} required autoComplete="email"
                placeholder="nom@centre.ma"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <label htmlFor="password" style={{ margin: 0 }}>Mot de passe</label>
              <button
                type="button"
                onClick={() => { setForgotEmail(email); setForgotSent(false); setShowForgotModal(true); }}
                style={{ background: 'none', border: 'none', padding: 0, color: '#1B3A6B', fontSize: '.76rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="password" type="password" value={password} required minLength={6}
                placeholder="••••••••••••"
                autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ? <Link href="/register">Créer un compte centre</Link>
        </p>

        <div className="auth-divider">Comptes de démonstration</div>

        <div className="demo-box">
          <strong>Mot de passe test : demo1234</strong>
          {DEMO_ACCOUNTS.map(({ label, email: de, color }) => (
            <button key={de} type="button" onClick={() => useDemo(de)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                {label}
              </span>
              <span style={{ fontSize: '.72rem', color: '#64748B' }}>{de}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Mot de passe oublié */}
      </main>

      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(9,24,46,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 16px 40px rgba(0,0,0,.15)' }}>
            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit}>
                <div className="row-between" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#1B3A6B', margin: 0 }}>
                    Mot de passe oublié ?
                  </h3>
                  <button type="button" onClick={() => setShowForgotModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                </div>
                <p style={{ fontSize: '.82rem', color: '#64748B', lineHeight: 1.5, marginBottom: 18 }}>
                  Saisissez votre e-mail ou téléphone WhatsApp associé à votre compte centre pour recevoir les instructions de réinitialisation.
                </p>

                <div className="auth-field">
                  <label htmlFor="forgotEmail">E-mail ou Téléphone WhatsApp</label>
                  <input
                    id="forgotEmail"
                    required
                    className="search-input"
                    style={{ width: '100%', paddingLeft: 12 }}
                    placeholder="directeur@centre.ma ou +212 6..."
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>

                <div className="row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForgotModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary btn-sm">Réinitialiser mon mot de passe</button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 4px' }}>
                <div className="avatar avatar-md avatar-green" style={{ width: 48, height: 48, margin: '0 auto 12px', fontSize: '1.3rem' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#1B3A6B', marginBottom: 8 }}>Demande envoyée !</h3>
                <p style={{ fontSize: '.82rem', color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
                  Un lien sécurisé de réinitialisation a été envoyé à l'adresse <strong>{forgotEmail}</strong> ainsi que sur votre numéro WhatsApp associé.
                </p>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowForgotModal(false)}>
                  Fermer et se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
