'use client'

import { useEffect, useState } from 'react'
import { api } from '../../../lib/api-client'

const STEPS = [
  { label: 'Informations élève', sub: 'Coordonnées personnelles' },
  { label: 'Groupe & Formation', sub: 'Choix du groupe et tarif' },
  { label: 'Confirmation', sub: 'Récapitulatif et contrat' },
]

const MOCK_GROUPS = [
  { id: 1, name: 'Anglais B2', schedule: 'Lun · Mer · Ven — 10h à 12h', spots: 2, total: 20, price: 520, formateur: 'M. Karimi' },
  { id: 2, name: 'Français A2 Soir', schedule: 'Mar · Jeu — 17h à 19h', spots: 6, total: 18, price: 380, formateur: 'Mme Alami' },
  { id: 3, name: 'Maths Avancés', schedule: 'Sam — 9h à 13h', spots: 4, total: 15, price: 600, formateur: 'M. El Fassi' },
]

const PLANS = [
  { id: 'mensuel', label: 'Mensuel', desc: 'Paiement chaque mois', factor: 1, badge: null },
  { id: 'trimestriel', label: 'Trimestriel', desc: 'Économisez 6%', factor: 2.82, badge: 'Populaire' },
  { id: 'annuel', label: 'Annuel', desc: 'Économisez 17%', factor: 9.96, badge: 'Meilleure offre' },
]

export default function InscriptionPage() {
  const [step, setStep] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState('mensuel')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successToast, setSuccessToast] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('Bienvenue2026!')
  const [groups, setGroups] = useState<any[]>([])
  const [groupsError, setGroupsError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    prenom: 'Ahmed',
    nom: 'Cherkaoui',
    dob: '2005-04-12',
    telephone: '+212 661 234 567',
    email: 'ahmed.cherkaoui@mail.com',
    ville: 'Casablanca',
    notes: 'Inscription recommandée par le centre Atlas.'
  })

  const group = groups[selectedGroup] ?? { id: '', name: 'Chargement des cohortes…', schedule: '', spots: 0, total: 0, price: 0, formateur: '' }
  const plan = PLANS.find(p => p.id === selectedPlan)!
  const totalPrice = (group.price * plan.factor).toFixed(0)

  useEffect(() => {
    api.get<any[]>('/director/enrollment-options').then(items => {
      setGroups(items.map(item => ({ id: item.id, name: item.nom, schedule: `${item.date_debut} → ${item.date_fin}`, spots: item.capacite - item.inscrits, total: item.capacite, price: Number(item.prix_mensuel), formateur: item.formateur ?? 'Non affecté' })))
    }).catch(error => setGroupsError(error instanceof Error ? error.message : 'Impossible de charger les cohortes.'))
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitInscription = async () => {
    setAccountError('')
    try {
      if (!group) throw new Error('Veuillez sélectionner une cohorte.')
      await api.post('/director/enrollments', { prenom: formData.prenom, nom: formData.nom, email: formData.email, password: temporaryPassword, telephone: formData.telephone || null, date_naissance: formData.dob || null, ville: formData.ville || null, adresse: formData.notes || null, cohorte_id: group.id, plan: selectedPlan })
      setShowSuccessModal(true)
      setSuccessToast(true)
      setTimeout(() => setSuccessToast(false), 4000)
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Impossible de créer le compte étudiant.')
    }
  }

  const resetForm = () => {
    setStep(0)
    setShowSuccessModal(false)
    setFormData({ prenom: '', nom: '', dob: '', telephone: '', email: '', ville: '', notes: '' })
  }

  return (
    <div>
      {/* Toast Notification */}
      {successToast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#15803D', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(21,128,61,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Élève inscrit avec succès et contrat généré !
        </div>
      )}

      {/* Page Header */}
      <div className="op-page-header">
        <div>
          <div className="op-breadcrumb">
            <span>Personnel</span>
            <span className="op-breadcrumb-sep">›</span>
            <span className="op-breadcrumb-active">Inscription</span>
          </div>
          <h1 className="op-page-title">Nouvelle inscription</h1>
          <p className="op-page-subtitle">Enregistrez un nouvel élève en 3 étapes simples</p>
        </div>
        <div>
          <span className="op-badge-step">Étape {step + 1} / {STEPS.length}</span>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="op-stepper">
        {STEPS.map((s, i) => {
          const isCompleted = i < step
          const isActive = i === step
          return (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="op-step-item" style={{ cursor: i <= step ? 'pointer' : 'default' }} onClick={() => i <= step && setStep(i)}>
                <div className={`op-step-circle ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}`}>
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="op-step-info">
                  <span className="op-step-title" style={{ color: isActive ? '#0F2347' : isCompleted ? '#D97706' : '#94A3B8' }}>{s.label}</span>
                  <span className="op-step-sub">{s.sub}</span>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`op-step-line ${i < step ? 'active' : ''}`} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Form area */}
        <div className="op-card" style={{ padding: '28px 32px' }}>
          {/* Step 1 */}
          {step === 0 && (
            <div>
              <div style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: 14, marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F2347', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 4, height: 18, background: '#D97706', borderRadius: 2 }} />
                  Informations élève
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Prénom</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF' }} value={formData.prenom} onChange={e => handleInputChange('prenom', e.target.value)} placeholder="Ahmed" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Nom</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF' }} value={formData.nom} onChange={e => handleInputChange('nom', e.target.value)} placeholder="Cherkaoui" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Date de naissance</label>
                  <div style={{ position: 'relative' }}>
                    <input className="search-input" type="date" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF' }} value={formData.dob} onChange={e => handleInputChange('dob', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Téléphone (WhatsApp)</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF' }} value={formData.telephone} onChange={e => handleInputChange('telephone', e.target.value)} placeholder="+212 661 234 567" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Adresse email</label>
                  <input className="search-input" type="email" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF' }} value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="ahmed.cherkaoui@mail.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Ville</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF' }} value={formData.ville} onChange={e => handleInputChange('ville', e.target.value)} placeholder="Casablanca" />
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155', marginBottom: 6 }}>Notes complémentaires</label>
                <textarea className="search-input" rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', resize: 'vertical' }} value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Inscription recommandée par le centre Atlas." />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div>
              <div style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: 14, marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F2347', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 4, height: 18, background: '#D97706', borderRadius: 2 }} />
                  Choisir un groupe
                </h2>
                <p style={{ fontSize: '.8rem', color: '#64748B', marginTop: 4 }}>Sélectionnez le groupe d'affectation de l'élève</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {groups.map((g, gi) => {
                  const selected = selectedGroup === gi
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGroup(gi)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 10,
                        border: `2px solid ${selected ? '#0F2347' : '#E2E8F0'}`,
                        background: selected ? '#F8FAFC' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all .15s ease',
                      }}
                    >
                      <div className="row-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.95rem', color: '#0F2347' }}>{g.name}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.95rem', color: '#D97706' }}>{g.price} DH / mois</span>
                      </div>
                      <div className="row-between">
                        <span style={{ fontSize: '.78rem', color: '#64748B' }}>{g.schedule} · Enseignant / Formateur : {g.formateur}</span>
                        <span className={`badge ${g.spots <= 2 ? 'badge-red' : 'badge-green'}`}>{g.spots} places restantes</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.9rem', color: '#0F2347', marginBottom: 14 }}>Plan de paiement</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {PLANS.map((p) => {
                    const selected = selectedPlan === p.id
                    return (
                      <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ padding: '14px', borderRadius: 10, border: `2px solid ${selected ? '#D97706' : '#E2E8F0'}`, background: selected ? '#FEFCE8' : '#FFFFFF', cursor: 'pointer', textAlign: 'center', transition: 'all .15s ease' }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '.88rem', color: selected ? '#B45309' : '#0F2347' }}>{p.label}</div>
                        <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 4 }}>{p.desc}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div>
              <div style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: 14, marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F2347', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 4, height: 18, background: '#D97706', borderRadius: 2 }} />
                  Confirmation de l'inscription
                </h2>
                <p style={{ fontSize: '.8rem', color: '#64748B', marginTop: 4 }}>Vérifiez les informations avant de valider et générer le contrat</p>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '20px', marginBottom: 24, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>Récapitulatif du dossier</div>
                {[
                  ['Nom & Prénom', `${formData.prenom} ${formData.nom}`],
                  ['Email', formData.email],
                  ['Téléphone', formData.telephone],
                  ['Ville', formData.ville],
                  ['Groupe', group.name],
                  ['Enseignant / Formateur affecté', group.formateur],
                  ['Planning', group.schedule],
                  ['Plan de paiement', plan.label],
                  ['Montant total', `${totalPrice} DH`],
                ].map(([k, v]) => (
                  <div key={k} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '.82rem', color: '#64748B' }}>{k}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.85rem', color: '#0F2347' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#EBF0FA', borderRadius: 10, padding: '16px 18px', marginBottom: 18, border: '1px solid #CBD5E1' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.8rem', color: '#0F2347', marginBottom: 6 }}>Compte étudiant</label>
                <p style={{ fontSize: '.75rem', color: '#64748B', marginBottom: 10 }}>Le compte participant sera créé avec l’adresse {formData.email || 'e-mail renseignée'}.</p>
                <input type="text" value={temporaryPassword} onChange={e => setTemporaryPassword(e.target.value)} minLength={8} aria-label="Mot de passe temporaire" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', boxSizing: 'border-box' }} />
              </div>

              {accountError && <div className="auth-error" style={{ marginBottom: 12 }}>{accountError}</div>}

              <button className="btn-navy" onClick={handleSubmitInscription} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Inscrire, créer le compte et générer le contrat
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="op-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.92rem', color: '#0F2347', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              Aperçu rapide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Élève', `${formData.prenom} ${formData.nom}`],
                ['Groupe', group.name],
                ['Tarif mensuel', `${group.price} DH`],
                ['Plan choisi', plan.label],
                ['Total estimé', `${totalPrice} DH`],
              ].map(([k, v]) => (
                <div key={k} className="row-between" style={{ paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '.8rem', color: '#64748B' }}>{k}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.84rem', color: '#0F2347' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1, justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                ← Retour
              </button>
            )}
            {step < 2 && (
              <button className="btn-navy" onClick={() => setStep(s => s + 1)} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                Suivant →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 460, textAlign: 'center', animation: 'authCardIn .3s ease' }}>
            <div className="avatar avatar-md avatar-green" style={{ width: 48, height: 48, margin: '0 auto 14px', fontSize: '1.2rem' }}>
              ✓
            </div>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: 6 }}>Inscription validée !</h2>
            <p className="card-meta" style={{ marginBottom: 20 }}>L'élève <strong>{formData.prenom} {formData.nom}</strong> a été inscrit dans le groupe <strong>{group.name}</strong> et affecté à <strong>{group.formateur}</strong>.</p>
            
            <div style={{ background: '#F8F9FB', borderRadius: 9, padding: '12px 14px', marginBottom: 20, textAlign: 'left', fontSize: '.78rem', color: '#374151', border: '1px solid #E8ECF2' }}>
              <div>📄 <strong>Contrat #CTR-2026-{Math.floor(1000 + Math.random() * 9000)}</strong></div>
              <div style={{ color: '#7A8CA0', marginTop: 2 }}>Transmis à {formData.telephone} par WhatsApp</div>
            </div>

            <div style={{ background: '#EBF0FA', borderRadius: 9, padding: '12px 14px', marginBottom: 20, textAlign: 'left', fontSize: '.78rem', color: '#0F2347', border: '1px solid #CBD5E1' }}>
              <div><strong>Compte participant créé</strong></div>
              <div style={{ marginTop: 4 }}>Identifiant : {formData.email}</div>
              <div>Mot de passe temporaire : {temporaryPassword}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => window.print()} style={{ flex: 1, justifyContent: 'center' }}>
                Imprimer contrat
              </button>
              <button className="btn btn-primary btn-sm" onClick={resetForm} style={{ flex: 1, justifyContent: 'center' }}>
                Nouvelle inscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
