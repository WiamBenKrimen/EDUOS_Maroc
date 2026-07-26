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

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <Link href="/" className="auth-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <Image src="/images/logo.png" alt="EDUOS MAROC" width={160} height={52} style={{ height: 48, width: 'auto', objectFit: 'contain' }} priority />
        </Link>

        <h1 className="auth-heading">Connexion</h1>
        <p className="auth-sub">Accédez à votre espace de gestion.</p>

        <form onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email" type="email" value={email} required autoComplete="email"
                placeholder="vous@centre.ma"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="password" type="password" value={password} required minLength={6}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ? <Link href="/register">Créer un compte</Link>
        </p>

        <div className="auth-divider">Comptes de démonstration</div>

        <div className="demo-box">
          <strong>Mot de passe : demo1234</strong>
          {DEMO_ACCOUNTS.map(({ label, email: de, color }) => (
            <button key={de} type="button" onClick={() => useDemo(de)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                {label}
              </span>
              <span>{de}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
