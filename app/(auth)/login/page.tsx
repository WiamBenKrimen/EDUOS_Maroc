'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { homeForRole, login } from '../../../lib/auth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = login(email, password)
      const requested = searchParams.get('next')
      const allowed = requested?.startsWith(`/${user.role}`)
      window.location.assign(allowed && requested ? requested : homeForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
      setLoading(false)
    }
  }

  function useDemo(emailDemo: string) {
    setEmail(emailDemo)
    setPassword('demo1234')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-logo">EDUOS</Link>
        <h1>Connexion</h1>
        <p>Accédez à votre espace de gestion.</p>

        <form onSubmit={submit}>
          <label>Adresse e-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@centre.ma" required autoComplete="email" />
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" required minLength={6} autoComplete="current-password" />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
        </form>

        <p className="auth-switch">Pas encore de compte ? <Link href="/register">Créer un compte</Link></p>
        <div className="demo-box">
          <strong>Comptes de démonstration</strong>
          {[
            ['Direction', 'directeur@eduos.ma'],
            ['Opérateur', 'operateur@eduos.ma'],
            ['Participant', 'participant@eduos.ma'],
            ['Admin', 'admin@eduos.ma'],
          ].map(([label, demoEmail]) => (
            <button key={demoEmail} type="button" onClick={() => useDemo(demoEmail)}>{label} · {demoEmail}</button>
          ))}
          <small>Mot de passe commun : demo1234</small>
        </div>
      </section>
    </main>
  )
}
