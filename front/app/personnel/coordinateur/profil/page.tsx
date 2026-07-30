'use client'

import { FormEvent, useState } from 'react'
import { changePassword, getUser } from '../../../../lib/auth'

export default function ProfilOperateurPage() {
  const user = getUser()
  const fullName = user?.nom ?? 'Sara Alaoui'
  const [prenom = '', ...nomParts] = fullName.split(' ')
  const nom = nomParts.join(' ')
  const initials = fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const [toast, setToast] = useState('')
  const [emailNotif, setEmailNotif] = useState(true)
  const [activityNotif, setActivityNotif] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    notify('Vos informations ont été enregistrées.')
  }

  const savePassword = () => {
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }

    try {
      changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      notify('Votre mot de passe a été modifié.')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.')
    }
  }

  return (
    <div className="profile-v2">
      {toast && <div className="part-toast"><span>✓</span>{toast}</div>}

      <header className="profile-v2-pagehead">
        <div className="page-breadcrumb">
          <span>Personnel</span><span>›</span><span>Mon profil</span>
        </div>
        <h1>Mon profil</h1>
        <p>Gérez vos informations personnelles, votre sécurité et vos préférences.</p>
      </header>

      <section className="profile-v2-identity">
        <div className="profile-v2-avatar">{initials}</div>
        <div className="profile-v2-name">
          <span>OPÉRATEUR</span>
          <h2>{fullName}</h2>
          <p>Gestion opérationnelle du centre</p>
        </div>
        <div className="profile-v2-meta">
          <div><small>IDENTIFIANT</small><strong>EDU-O-2026-012</strong></div>
          <div><small>CENTRE</small><strong>Centre Atlas</strong></div>
          <div><small>STATUT</small><strong className="active"><i/> Actif</strong></div>
        </div>
      </section>

      <div className="profile-v2-workspace">
        <main className="profile-v2-content">
          <form onSubmit={saveProfile}>
            <div className="profile-v2-section">
              <span>INFORMATIONS PERSONNELLES</span>
              <h2>Votre identité</h2>
              <p>Ces informations sont associées à votre compte opérateur.</p>
            </div>

            <div className="profile-v2-fields">
              <label>Prénom<input defaultValue={prenom}/></label>
              <label>Nom<input defaultValue={nom}/></label>
              <label>Adresse e-mail<input type="email" defaultValue={user?.email ?? 'coordinateur@eduos.ma'}/></label>
              <label>Téléphone<input defaultValue="+212 6 12 34 56 78"/></label>
            </div>

            <div className="profile-v2-section second">
              <span>PRÉFÉRENCES</span>
              <h2>Vos notifications</h2>
              <p>Choisissez les informations que vous souhaitez recevoir.</p>
            </div>

            <div className="profile-v2-toggles">
              <label>
                <span><strong>Notifications par e-mail</strong><small>Paiements, documents et annonces importantes</small></span>
                <input type="checkbox" checked={emailNotif} onChange={event => setEmailNotif(event.target.checked)}/>
              </label>
              <label>
                <span><strong>Alertes opérationnelles</strong><small>Planning, présences et nouvelles demandes</small></span>
                <input type="checkbox" checked={activityNotif} onChange={event => setActivityNotif(event.target.checked)}/>
              </label>
            </div>

            <div className="profile-v2-section second">
              <span>SÉCURITÉ</span>
              <h2>Changer votre mot de passe</h2>
              <p>Le nouveau mot de passe sera utilisé dès votre prochaine connexion.</p>
            </div>

            <div className="profile-v2-password">
              <label>Mot de passe actuel<input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} autoComplete="current-password" placeholder="Votre mot de passe actuel"/></label>
              <label>Nouveau mot de passe<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="8 caractères minimum"/></label>
              <label>Confirmer le nouveau mot de passe<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Répétez le nouveau mot de passe"/></label>
              {passwordError && <p>{passwordError}</p>}
              <button type="button" onClick={savePassword}>Mettre à jour le mot de passe</button>
            </div>

            <footer className="profile-v2-actions">
              <button type="submit">Enregistrer les informations</button>
            </footer>
          </form>
        </main>
      </div>
    </div>
  )
}
