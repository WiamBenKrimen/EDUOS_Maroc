'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { homeForRole, register, type Role } from '../../../lib/auth'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
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
        role: String(data.get('role')) as Role,
      })
      window.location.assign(homeForRole(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible.')
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-logo">EDUOS</Link>
        <h1>Créer un compte</h1>
        <p>Configurez votre accès à la plateforme.</p>
        <form onSubmit={submit}>
          <label>Nom complet</label>
          <input name="nom" required minLength={2} autoComplete="name" />
          <label>Adresse e-mail</label>
          <input name="email" type="email" required autoComplete="email" />
          <label>Profil</label>
          <select name="role" defaultValue="participant" required>
            <option value="participant">Participant</option>
            <option value="operateur">Opérateur</option>
            <option value="directeur">Directeur</option>
          </select>
          <label>Mot de passe</label>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" />
          <label>Confirmer le mot de passe</label>
          <input name="confirmation" type="password" required minLength={8} autoComplete="new-password" />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Création…' : 'Créer mon compte'}</button>
        </form>
        <p className="auth-switch">Déjà inscrit ? <Link href="/login">Se connecter</Link></p>
      </section>
    </main>
  )
}
