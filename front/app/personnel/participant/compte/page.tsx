'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { getUser, setUser } from '@/lib/auth'
import type { ParticipantProfile } from '@/lib/participant-types'

type AccountForm = { prenom: string; nom: string; email: string; telephone: string; date_naissance: string; adresse: string; ville: string; email_notifications: boolean; course_reminders: boolean }
const emptyForm: AccountForm = { prenom: '', nom: '', email: '', telephone: '', date_naissance: '', adresse: '', ville: '', email_notifications: true, course_reminders: true }

export default function ComptePage() {
  const [profile, setProfile] = useState<ParticipantProfile | null>(null)
  const [form, setForm] = useState<AccountForm>(emptyForm)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { api.get<ParticipantProfile>('/participant/account').then(item => { setProfile(item); setForm({ prenom: item.prenom, nom: item.nom, email: item.email, telephone: item.telephone ?? '', date_naissance: item.date_naissance ?? '', adresse: item.adresse ?? '', ville: item.ville ?? '', email_notifications: item.email_notifications, course_reminders: item.course_reminders }) }).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger le compte.')) }, [])

  async function save(event: FormEvent) {
    event.preventDefault(); setError('')
    try {
      const updated = await api.patch<ParticipantProfile>('/participant/account', { ...form, telephone: form.telephone || null, date_naissance: form.date_naissance || null, adresse: form.adresse || null, ville: form.ville || null })
      setProfile(updated); const current = getUser(); if (current) setUser({ ...current, nom: `${updated.prenom} ${updated.nom}`, email: updated.email }); setNotice('Vos informations ont été enregistrées dans PostgreSQL.')
    } catch (error) { setError(error instanceof Error ? error.message : 'Impossible d’enregistrer le compte.') }
  }

  async function savePassword() {
    setError('')
    if (newPassword.length < 8) { setError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
    if (newPassword !== confirmPassword) { setError('Les deux nouveaux mots de passe ne correspondent pas.'); return }
    try { await api.patch('/participant/account/password', { current_password: currentPassword, new_password: newPassword }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setNotice('Mot de passe modifié dans le backend.') }
    catch (error) { setError(error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.') }
  }

  const initials = `${profile?.prenom?.[0] ?? ''}${profile?.nom?.[0] ?? ''}`.toUpperCase()
  return <div className="profile-v2">
    {notice && <div className="part-toast"><span>✓</span>{notice}</div>}{error && <div className="auth-error" role="alert">{error}</div>}
    <header className="profile-v2-pagehead"><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Mon compte</span></div><h1>Mon compte</h1><p>Informations personnelles, sécurité et préférences.</p></header>
    <section className="profile-v2-identity"><div className="profile-v2-avatar">{initials || '—'}</div><div className="profile-v2-name"><span>PARTICIPANT</span><h2>{profile ? `${profile.prenom} ${profile.nom}` : 'Chargement…'}</h2><p>{profile?.formation ?? 'Aucune formation'} · {profile?.cohorte ?? 'Aucune cohorte'}</p></div><div className="profile-v2-meta"><div><small>IDENTIFIANT</small><strong>{profile?.matricule ?? '—'}</strong></div><div><small>CENTRE</small><strong>{profile?.centre ?? '—'}</strong></div><div><small>STATUT</small><strong className="active"><i /> {profile?.statut ?? '—'}</strong></div></div></section>
    <div className="profile-v2-workspace"><main className="profile-v2-content"><form onSubmit={save}><div className="profile-v2-section"><span>INFORMATIONS PERSONNELLES</span><h2>Votre identité</h2><p>Ces informations sont utilisées pour vos documents officiels.</p></div><div className="profile-v2-fields"><label>Prénom<input value={form.prenom} onChange={event => setForm(current => ({ ...current, prenom: event.target.value }))} /></label><label>Nom<input value={form.nom} onChange={event => setForm(current => ({ ...current, nom: event.target.value }))} /></label><label>Adresse e-mail<input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></label><label>Téléphone<input value={form.telephone} onChange={event => setForm(current => ({ ...current, telephone: event.target.value }))} /></label><label>Date de naissance<input type="date" value={form.date_naissance} onChange={event => setForm(current => ({ ...current, date_naissance: event.target.value }))} /></label><label>Ville<input value={form.ville} onChange={event => setForm(current => ({ ...current, ville: event.target.value }))} /></label><label style={{ gridColumn: '1/-1' }}>Adresse<input value={form.adresse} onChange={event => setForm(current => ({ ...current, adresse: event.target.value }))} /></label></div><div className="profile-v2-section second"><span>PRÉFÉRENCES</span><h2>Vos notifications</h2></div><div className="profile-v2-toggles"><label><span><strong>Notifications par e-mail</strong><small>Paiements, documents et annonces importantes</small></span><input type="checkbox" checked={form.email_notifications} onChange={event => setForm(current => ({ ...current, email_notifications: event.target.checked }))} /></label><label><span><strong>Rappels de cours</strong><small>Un rappel avant chaque séance planifiée</small></span><input type="checkbox" checked={form.course_reminders} onChange={event => setForm(current => ({ ...current, course_reminders: event.target.checked }))} /></label></div><div className="profile-v2-section second"><span>SÉCURITÉ</span><h2>Changer votre mot de passe</h2></div><div className="profile-v2-password"><label>Mot de passe actuel<input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label><label>Nouveau mot de passe<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label><label>Confirmation<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label><button type="button" onClick={() => void savePassword()}>Mettre à jour le mot de passe</button></div><div className="profile-v2-actions"><button type="submit">Enregistrer les modifications</button></div></form></main><aside className="profile-v2-aside"><section><span>INSCRIPTION ACTIVE</span><h3>{profile?.formation ?? 'Aucune inscription'}</h3><p>{profile?.cohorte}</p><dl><div><dt>Référence</dt><dd>{profile?.inscription_reference ?? '—'}</dd></div><div><dt>Formateur</dt><dd>{profile?.formateur || 'Non affecté'}</dd></div><div><dt>Fin prévue</dt><dd>{profile?.date_fin_prevue ? new Date(profile.date_fin_prevue).toLocaleDateString('fr-FR') : '—'}</dd></div></dl></section></aside></div>
  </div>
}
