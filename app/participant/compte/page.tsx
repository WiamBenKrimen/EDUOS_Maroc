'use client'

import { FormEvent, useState } from 'react'
import { changePassword } from '../../../lib/auth'

export default function ComptePage(){
 const[toast,setToast]=useState('');const[emailNotif,setEmailNotif]=useState(true);const[courseNotif,setCourseNotif]=useState(true)
 const[currentPassword,setCurrentPassword]=useState('');const[newPassword,setNewPassword]=useState('');const[confirmPassword,setConfirmPassword]=useState('');const[passwordError,setPasswordError]=useState('')
 const notify=(text:string)=>{setToast(text);window.setTimeout(()=>setToast(''),2600)}
 const save=(e:FormEvent)=>{e.preventDefault();notify('Vos informations ont été enregistrées.')}
 const savePassword=()=>{setPasswordError('');if(newPassword.length<8){setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');return}if(newPassword!==confirmPassword){setPasswordError('Les deux nouveaux mots de passe ne correspondent pas.');return}try{changePassword(currentPassword,newPassword);setCurrentPassword('');setNewPassword('');setConfirmPassword('');notify('Mot de passe modifié. Vous pourrez l’utiliser à la prochaine connexion.')}catch(error){setPasswordError(error instanceof Error?error.message:'Impossible de modifier le mot de passe.')}}
 return <div className="profile-v2">
  {toast&&<div className="part-toast"><span>✓</span>{toast}</div>}
  <header className="profile-v2-pagehead"><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Mon compte</span></div><h1>Mon compte</h1><p>Gérez vos informations personnelles, votre sécurité et vos préférences.</p></header>

  <section className="profile-v2-identity">
   <div className="profile-v2-avatar">YB</div>
   <div className="profile-v2-name"><span>PARTICIPANTE</span><h2>Yasmine Bennani</h2><p>Anglais B2 · Groupe du matin</p></div>
   <div className="profile-v2-meta"><div><small>IDENTIFIANT</small><strong>EDU-P-2025-084</strong></div><div><small>CENTRE</small><strong>EDUOS Rabat</strong></div><div><small>STATUT</small><strong className="active"><i/> Actif</strong></div></div>
  </section>

  <div className="profile-v2-workspace">
   <main className="profile-v2-content">
    <form onSubmit={save}>
     <div className="profile-v2-section"><span>INFORMATIONS PERSONNELLES</span><h2>Votre identité</h2><p>Ces informations sont utilisées pour vos documents officiels.</p></div>
     <div className="profile-v2-fields"><label>Prénom<input defaultValue="Yasmine"/></label><label>Nom<input defaultValue="Bennani"/></label><label>Adresse e-mail<input type="email" defaultValue="yasmine.bennani@email.ma"/></label><label>Téléphone<input defaultValue="+212 6 12 34 56 78"/></label></div>
     <div className="profile-v2-section second"><span>PRÉFÉRENCES</span><h2>Vos notifications</h2><p>Choisissez comment EDUOS doit vous informer.</p></div>
     <div className="profile-v2-toggles"><label><span><strong>Notifications par e-mail</strong><small>Paiements, documents et annonces importantes</small></span><input type="checkbox" checked={emailNotif} onChange={e=>setEmailNotif(e.target.checked)}/></label><label><span><strong>Rappels de cours</strong><small>Un rappel avant chaque séance planifiée</small></span><input type="checkbox" checked={courseNotif} onChange={e=>setCourseNotif(e.target.checked)}/></label></div>
     <div className="profile-v2-section second"><span>SÉCURITÉ</span><h2>Changer votre mot de passe</h2><p>Le nouveau mot de passe sera utilisé dès votre prochaine connexion.</p></div>
     <div className="profile-v2-password">
      <label>Mot de passe actuel<input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="Votre mot de passe actuel"/></label>
      <label>Nouveau mot de passe<input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password" placeholder="8 caractères minimum"/></label>
      <label>Confirmer le nouveau mot de passe<input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Répétez le nouveau mot de passe"/></label>
      {passwordError&&<p>{passwordError}</p>}
      <button type="button" onClick={savePassword}>Mettre à jour le mot de passe</button>
     </div>
     <footer className="profile-v2-actions"><button type="submit">Enregistrer les informations</button></footer>
    </form>
   </main>
  </div>
 </div>
}
