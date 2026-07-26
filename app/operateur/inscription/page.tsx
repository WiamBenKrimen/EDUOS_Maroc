'use client'

import { useState } from 'react'

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

  const group = MOCK_GROUPS[selectedGroup]
  const plan = PLANS.find(p => p.id === selectedPlan)!
  const totalPrice = (group.price * plan.factor).toFixed(0)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitInscription = () => {
    setShowSuccessModal(true)
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 4000)
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
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(5,150,105,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Élève inscrit avec succès et contrat généré !
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Opérateur</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Inscription</span>
          </div>
          <h1 className="page-title">Nouvelle inscription</h1>
          <p className="page-subtitle">Enregistrez un nouvel élève en 3 étapes simples</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-green">Étape {step + 1} / {STEPS.length}</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="card card-p" style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        {STEPS.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: i <= step ? 'pointer' : 'default' }} onClick={() => i <= step && setStep(i)}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: i < step ? '#C9922A' : i === step ? '#1B3A6B' : 'rgba(27,58,107,.08)',
                display: 'flex', alignItems: 'center', justifyCenter: 'center',
                transition: 'background .25s',
              }}>
                {i < step ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: i === step ? '#fff' : 'rgba(27,58,107,.4)' }}>{i + 1}</span>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.78rem', color: i === step ? '#1B3A6B' : i < step ? '#C9922A' : '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</div>
                <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? '#C9922A' : 'rgba(27,58,107,.1)', margin: '0 16px', marginBottom: 28, borderRadius: 2, transition: 'background .3s' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Form area */}
        <div className="card card-p" style={{ padding: '30px' }}>
          {/* Step 1 */}
          {step === 0 && (
            <div>
              <h2 className="card-title" style={{ fontSize: '1.05rem', marginBottom: 20 }}>Informations élève</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Prénom</label>
                  <input className="search-input" style={{ paddingLeft: 14 }} value={formData.prenom} onChange={e => handleInputChange('prenom', e.target.value)} placeholder="ex: Ahmed" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Nom</label>
                  <input className="search-input" style={{ paddingLeft: 14 }} value={formData.nom} onChange={e => handleInputChange('nom', e.target.value)} placeholder="ex: Cherkaoui" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Date de naissance</label>
                  <input className="search-input" type="date" style={{ paddingLeft: 14 }} value={formData.dob} onChange={e => handleInputChange('dob', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Téléphone (WhatsApp)</label>
                  <input className="search-input" style={{ paddingLeft: 14 }} value={formData.telephone} onChange={e => handleInputChange('telephone', e.target.value)} placeholder="+212 6XX XXX XXX" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Adresse email</label>
                  <input className="search-input" type="email" style={{ paddingLeft: 14 }} value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="exemple@mail.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Ville</label>
                  <input className="search-input" style={{ paddingLeft: 14 }} value={formData.ville} onChange={e => handleInputChange('ville', e.target.value)} placeholder="ex: Casablanca" />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.76rem', color: '#374151', marginBottom: 6 }}>Notes complémentaires</label>
                <textarea className="search-input" rows={3} style={{ paddingLeft: 14, resize: 'vertical' }} value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Informations supplémentaires, besoins spécifiques…" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div>
              <h2 className="card-title" style={{ fontSize: '1.05rem', marginBottom: 6 }}>Choisir un groupe</h2>
              <p className="card-meta" style={{ marginBottom: 20 }}>Sélectionnez le groupe d'affectation de l'élève</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {MOCK_GROUPS.map((g, gi) => {
                  const selected = selectedGroup === gi
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGroup(gi)}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 10,
                        border: `2px solid ${selected ? '#1B3A6B' : '#E8ECF2'}`,
                        background: selected ? '#EBF0FA' : '#fff',
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      <div className="row-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.9rem', color: '#1B3A6B' }}>{g.name}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.92rem', color: '#C9922A' }}>{g.price} DH / mois</span>
                      </div>
                      <div className="row-between">
                        <span className="card-meta">{g.schedule} · Formateur: {g.formateur}</span>
                        <span className={`badge ${g.spots <= 2 ? 'badge-red' : 'badge-green'}`}>{g.spots} places restantes</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid #EEF0F4', paddingTop: 20 }}>
                <h3 className="card-title" style={{ fontSize: '.88rem', marginBottom: 12 }}>Plan de paiement</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {PLANS.map((p) => {
                    const selected = selectedPlan === p.id
                    return (
                      <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ padding: '12px 14px', borderRadius: 9, border: `2px solid ${selected ? '#C9922A' : '#E8ECF2'}`, background: selected ? 'rgba(201,146,42,.08)' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '.84rem', color: selected ? '#C9922A' : '#1a2535' }}>{p.label}</div>
                        <div style={{ fontSize: '.7rem', color: '#9AABBC', marginTop: 2 }}>{p.desc}</div>
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
              <h2 className="card-title" style={{ fontSize: '1.05rem', marginBottom: 6 }}>Confirmation de l'inscription</h2>
              <p className="card-meta" style={{ marginBottom: 20 }}>Vérifiez les informations avant de valider et générer le contrat</p>

              <div style={{ background: '#F8F9FB', borderRadius: 10, padding: '18px 20px', marginBottom: 20, border: '1px solid #E8ECF2' }}>
                <div className="card-title" style={{ fontSize: '.72rem', color: '#7A8CA0', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Récapitulatif du dossier</div>
                {[
                  ['Nom & Prénom', `${formData.prenom} ${formData.nom}`],
                  ['Email', formData.email],
                  ['Téléphone', formData.telephone],
                  ['Ville', formData.ville],
                  ['Groupe', group.name],
                  ['Formateur', group.formateur],
                  ['Planning', group.schedule],
                  ['Plan de paiement', plan.label],
                  ['Montant total', `${totalPrice} DH`],
                ].map(([k, v]) => (
                  <div key={k} className="row-between" style={{ padding: '7px 0', borderBottom: '1px solid #EEF0F4' }}>
                    <span className="card-meta">{k}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: '.83rem', color: '#1a2535' }}>{v}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleSubmitInscription} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Inscrire et générer le contrat PDF
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Summary & Nav Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card card-p">
            <div className="card-title" style={{ fontSize: '.72rem', color: '#7A8CA0', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Aperçu rapide</div>
            {[
              ['Élève', `${formData.prenom} ${formData.nom}`],
              ['Groupe', group.name],
              ['Tarif mensuel', `${group.price} DH`],
              ['Plan choisi', plan.label],
              ['Total estimé', `${totalPrice} DH`],
            ].map(([k, v]) => (
              <div key={k} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid #EEF0F4' }}>
                <span className="card-meta">{k}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: '.8rem', color: '#1a2535' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1, justifyContent: 'center' }}>
                ← Retour
              </button>
            )}
            {step < 2 && (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} style={{ flex: 1, justifyContent: 'center' }}>
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
            <p className="card-meta" style={{ marginBottom: 20 }}>L'élève <strong>{formData.prenom} {formData.nom}</strong> a été inscrit dans le groupe <strong>{group.name}</strong>.</p>
            
            <div style={{ background: '#F8F9FB', borderRadius: 9, padding: '12px 14px', marginBottom: 20, textStyle: 'left', fontSize: '.78rem', color: '#374151', border: '1px solid #E8ECF2' }}>
              <div>📄 <strong>Contrat #CTR-2026-{Math.floor(1000 + Math.random() * 9000)}</strong></div>
              <div style={{ color: '#7A8CA0', marginTop: 2 }}>Transmis à {formData.telephone} par WhatsApp</div>
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
