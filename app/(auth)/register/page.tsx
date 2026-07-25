'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { homeForRole, register, type Role } from '../../../lib/auth'

const ROLES: { value: Role; label: string; icon: string; desc: string }[] = [
  { value: 'participant', label: 'Participant', icon: '🎓', desc: 'Accéder à mes formations' },
  { value: 'operateur', label: 'Opérateur', icon: '⚙️', desc: 'Gérer le centre' },
  { value: 'directeur', label: 'Directeur', icon: '📊', desc: 'Piloter l\'établissement' },
]

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>('participant')

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const data = new FormData(e.currentTarget)
    const password = String(data.get('password'))
    const confirmation = String(data.get('confirmation'))
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const user = register({
        nom: String(data.get('nom')).trim(),
        email: String(data.get('email')).trim(),
        password,
        role,
      })
      window.location.assign(homeForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <Link href="/" className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
          </div>
          <span className="auth-logo-name">EDUOS</span>
        </Link>

        <h1 className="auth-heading">Créer un compte</h1>
        <p className="auth-sub">Configurez votre accès à la plateforme.</p>

        <form onSubmit={submit}>
          {/* Nom */}
          <div className="auth-field">
            <label htmlFor="nom">Nom complet</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input id="nom" name="nom" required minLength={2} autoComplete="name" placeholder="Votre nom complet" />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="reg-email">Adresse e-mail</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input id="reg-email" name="email" type="email" required autoComplete="email" placeholder="vous@centre.ma" />
            </div>
          </div>

          {/* Profil */}
          <div className="auth-field">
            <label>Profil</label>
            <div className="auth-role-grid">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`auth-role-card${role === r.value ? ' selected' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <div className="auth-role-card-icon">{r.icon}</div>
                  <div className="auth-role-card-label">{r.label}</div>
                  <div className="auth-role-card-desc">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" />
            </div>
          </div>

          {/* Confirm */}
          <div className="auth-field">
            <label htmlFor="confirmation">Confirmer</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <input id="confirmation" name="confirmation" type="password" required minLength={8} autoComplete="new-password" placeholder="Répétez le mot de passe" />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-switch">
          Déjà inscrit ? <Link href="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
