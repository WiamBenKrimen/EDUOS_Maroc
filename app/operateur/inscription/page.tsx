'use client'
import { useState } from 'react'

const NAVY = '#1B3A6B'
const NAVY_DARK = '#0F2347'
const GOLD = '#C9922A'

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(27,58,107,.06)',
  border: '1px solid rgba(27,58,107,.07)',
}

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

const FIELDS: [string, string, string][] = [
  ['Prénom', 'text', 'ex: Ahmed'],
  ['Nom', 'text', 'ex: Cherkaoui'],
  ['Date de naissance', 'date', ''],
  ['Téléphone', 'tel', '+212 6XX XXX XXX'],
  ['Email', 'email', 'exemple@mail.com'],
  ['Ville', 'text', 'ex: Casablanca'],
]

function Input({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 12.5, color: '#374151', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(27,58,107,.15)', fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: '#1a1823', outline: 'none', boxSizing: 'border-box', background: '#fff', transition: 'border-color .15s' }}
        onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(27,58,107,.15)')}
      />
    </div>
  )
}

export default function InscriptionPage() {
  const [step, setStep] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState('mensuel')

  const group = MOCK_GROUPS[selectedGroup]
  const plan = PLANS.find(p => p.id === selectedPlan)!
  const totalPrice = (group.price * plan.factor).toFixed(0)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 26, color: NAVY_DARK, marginBottom: 4 }}>Nouvelle inscription</h1>
        <p style={{ fontSize: 13.5, color: '#64748b' }}>Enregistrez un nouvel élève en 3 étapes simples</p>
      </div>

      {/* Step indicator */}
      <div style={{ ...CARD_STYLE, padding: '22px 32px', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        {STEPS.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: i < step ? GOLD : i === step ? NAVY : 'rgba(27,58,107,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .25s',
              }}>
                {i < step ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13, color: i === step ? '#fff' : 'rgba(27,58,107,.4)' }}>{i + 1}</span>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12.5, color: i === step ? NAVY : i < step ? GOLD : '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? GOLD : 'rgba(27,58,107,.1)', margin: '0 16px', marginBottom: 28, borderRadius: 2, transition: 'background .3s' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Form area */}
        <div style={{ ...CARD_STYLE, padding: '30px' }}>
          {/* Step 1 */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: NAVY_DARK, marginBottom: 24 }}>Informations élève</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {FIELDS.map(([label, type, placeholder]) => (
                  <Input key={label} label={label} type={type} placeholder={placeholder} />
                ))}
              </div>
              <div style={{ marginTop: 18 }}>
                <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 12.5, color: '#374151', marginBottom: 6 }}>Notes complémentaires</label>
                <textarea rows={3} placeholder="Informations supplémentaires, besoins spécifiques…" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(27,58,107,.15)', fontFamily: "'Inter', sans-serif", fontSize: 13.5, outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#1a1823' }} onFocus={e => (e.currentTarget.style.borderColor = NAVY)} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(27,58,107,.15)')} />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: NAVY_DARK, marginBottom: 8 }}>Choisir un groupe</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 22 }}>Sélectionnez le groupe qui correspond à l'élève</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {MOCK_GROUPS.map((g, gi) => {
                  const selected = selectedGroup === gi
                  return (
                    <div key={g.id} onClick={() => setSelectedGroup(gi)} style={{ padding: '18px 20px', borderRadius: 11, border: `2px solid ${selected ? NAVY : 'rgba(27,58,107,.12)'}`, background: selected ? 'rgba(27,58,107,.04)' : '#fff', cursor: 'pointer', transition: 'all .15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: '#1a1823', marginBottom: 3 }}>{g.name}</div>
                          <div style={{ fontSize: 12.5, color: '#64748b' }}>{g.schedule} · {g.formateur}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 16, color: NAVY }}>{g.price} DH<span style={{ fontWeight: 400, fontSize: 12, color: '#94a3b8' }}>/mois</span></div>
                          <div style={{ fontSize: 11.5, color: g.spots <= 2 ? '#DC2626' : '#059669', fontWeight: 600, marginTop: 2 }}>{g.spots} place{g.spots > 1 ? 's' : ''} dispo.</div>
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(27,58,107,.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((g.total - g.spots) / g.total) * 100}%`, background: g.spots <= 2 ? '#DC2626' : NAVY, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>{g.total - g.spots}/{g.total} élèves inscrits</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid rgba(27,58,107,.08)', paddingTop: 24 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: NAVY_DARK, marginBottom: 14 }}>Plan de paiement</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {PLANS.map((p) => {
                    const selected = selectedPlan === p.id
                    return (
                      <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${selected ? GOLD : 'rgba(27,58,107,.12)'}`, background: selected ? 'rgba(201,146,42,.05)' : '#fff', cursor: 'pointer', position: 'relative', textAlign: 'center', transition: 'all .15s' }}>
                        {p.badge && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: GOLD, color: '#fff', fontSize: 9.5, fontWeight: 800, borderRadius: 99, padding: '2px 8px', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>{p.badge}</span>}
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: selected ? GOLD : '#1a1823' }}>{p.label}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>{p.desc}</div>
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
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: NAVY_DARK, marginBottom: 8 }}>Confirmation de l'inscription</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Vérifiez les informations avant de valider</p>

              {/* Summary */}
              <div style={{ background: '#F5F6F8', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Récapitulatif</div>
                {[
                  ['Élève', 'Ahmed Cherkaoui'],
                  ['Email', 'ahmed.cherkaoui@mail.com'],
                  ['Téléphone', '+212 661 234 567'],
                  ['Groupe', group.name],
                  ['Formateur', group.formateur],
                  ['Planning', group.schedule],
                  ['Plan de paiement', plan.label],
                  ['Montant', `${totalPrice} DH (${plan.label.toLowerCase()})`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(27,58,107,.06)' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1823' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(5,150,105,.06)', borderRadius: 10, padding: '14px 16px', marginBottom: 24, border: '1px solid rgba(5,150,105,.15)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div style={{ fontSize: 12.5, color: '#059669', lineHeight: 1.5 }}>Un contrat PDF sera généré automatiquement et envoyé par WhatsApp à l'élève et au parent.</div>
              </div>

              <button style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,58,107,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                Inscrire et générer le contrat
              </button>
            </div>
          )}
        </div>

        {/* Sidebar summary + navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...CARD_STYLE, padding: '22px' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Aperçu</div>
            {[
              ['Élève', 'Ahmed Cherkaoui'],
              ['Groupe', group.name],
              ['Tarif', `${group.price} DH/mois`],
              ['Plan', plan.label],
              ['Total', `${totalPrice} DH`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(27,58,107,.06)' }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{k}</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1823' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '12px', borderRadius: 9, border: '1.5px solid rgba(27,58,107,.15)', background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: '#64748b', cursor: 'pointer' }}>
                ← Retour
              </button>
            )}
            {step < 2 && (
              <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: '12px', borderRadius: 9, border: 'none', background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,58,107,.25)' }}>
                Suivant →
              </button>
            )}
          </div>

          {/* Help card */}
          <div style={{ ...CARD_STYLE, padding: '18px 20px', background: 'rgba(27,58,107,.03)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12.5, color: NAVY, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Besoin d'aide ?
            </div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>Contactez le responsable pédagogique si vous avez des questions sur les groupes ou les tarifs.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
