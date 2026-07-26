'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const INITIAL_FORMATEURS = [
  { id: 1, name: 'Karim Alaoui', initials: 'KA', spec: 'Anglais B2', heures: 32, taux: 120, paid: true },
  { id: 2, name: 'Leila Bennouna', initials: 'LB', spec: 'Français A2', heures: 24, taux: 110, paid: false },
  { id: 3, name: 'Omar El Fassi', initials: 'OE', spec: 'Espagnol Déb.', heures: 20, taux: 100, paid: true },
  { id: 4, name: 'Sanaa Tahiri', initials: 'ST', spec: 'Management', heures: 28, taux: 130, paid: false },
]

const STAT_CARDS = [
  {
    label: 'Élèves inscrits',
    value: '347',
    trend: '+12 ce mois',
    trendUp: true,
    bg: '#EBF5FF',
    color: '#0284C7',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    label: 'CA encaisse (mois)',
    value: '84 200 DH',
    trend: '+8.4 %',
    trendUp: true,
    bg: '#FEF3C7',
    color: '#D97706',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )
  },
  {
    label: 'Mensualités en retard',
    value: '23',
    trend: '-3 cette semaine',
    trendUp: false,
    bg: '#FEE2E2',
    color: '#DC2626',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  },
  {
    label: 'Présence globale',
    value: '87 %',
    trend: 'Stable',
    trendUp: true,
    bg: '#ECFDF5',
    color: '#059669',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    )
  },
]

const GROUPS = [
  { name: 'Anglais B2', detail: '18 / 20 élèves', pct: 90, color: '#D97706' },
  { name: 'Français A2 Soir', detail: '14 / 18 élèves', pct: 78, color: '#1B3A6B' },
  { name: 'Espagnol Débutant', detail: '11 / 15 élèves', pct: 73, color: '#0284C7' },
  { name: 'Maths Avancés', detail: '19 / 20 élèves', pct: 95, color: '#059669' },
]

const RENEWALS = [
  { id: 1, name: 'Karim Ouali', date: '28 Jan', days: 3 },
  { id: 2, name: 'Sara El Mansouri', date: '31 Jan', days: 6 },
  { id: 3, name: 'Nour Chraibi', date: '05 Fév', days: 11 },
  { id: 4, name: 'Ahmed Tahiri', date: '10 Fév', days: 16 },
]

export default function DirecteurDashboard() {
  const [formateurs, setFormateurs] = useState(INITIAL_FORMATEURS)
  const [showActionModal, setShowActionModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  
  // Action Modal form
  const [actionType, setActionType] = useState('cohorte')
  const [actionName, setActionName] = useState('')

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const togglePaymentStatus = (id: number) => {
    setFormateurs(prev => prev.map(f => f.id === id ? { ...f, paid: !f.paid } : f))
    triggerToast('Statut de rémunération du formateur mis à jour !')
  }

  const exportPayrollPDF = () => {
    const textContent = `EDUOS MAROC - DIRECTION GÉNÉRALE\n` +
      `RECAPITULATIF HONORAIRES FORMATEURS - JUILLET 2025\n` +
      `======================================================\n` +
      formateurs.map(f => `${f.name} (${f.spec}) : ${f.heures}h x ${f.taux} DH = ${f.heures * f.taux} DH | Statut: ${f.paid ? 'Payé' : 'En attente'}`).join('\n') +
      `\n======================================================\n` +
      `TOTAL HEURES: 104h | MONTANT TOTAL: 12 440 DH`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Remunerations_Formateurs_Juillet_2025.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Exportation du rapport de rémunération effectuée !`)
  }

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowActionModal(false)
    triggerToast(`Action "${actionName || 'Nouvelle tâche'}" créée avec succès !`)
    setActionName('')
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: NAVY,
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.85rem',
          fontWeight: 600,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ color: '#10B981' }}>✓</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Tableau de bord Direction</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Vue synthétique de la performance de votre centre · Rabat Hassan</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={exportPayrollPDF}
            style={{
              padding: '9px 16px',
              borderRadius: 9,
              border: '1px solid #E2E8F0',
              background: '#fff',
              color: NAVY,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter le rapport
          </button>
          <button
            onClick={() => setShowActionModal(true)}
            style={{
              padding: '9px 16px',
              borderRadius: 9,
              border: 'none',
              background: BLUE,
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(27,58,107,0.2)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle action
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {STAT_CARDS.map((c) => (
          <div
            key={c.label}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 20,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(15,35,71,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: `${c.bg}`, padding: '3px 8px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {c.trend}
              </span>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, lineHeight: 1, marginBottom: 4 }}>
                {c.value}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Column Section Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        {/* Active Cohorts */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, margin: 0 }}>Groupes actifs</h3>
            <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>4 groupes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {GROUPS.map(g => (
              <div key={g.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 700, color: NAVY }}>{g.name}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{g.detail}</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Renewals */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, margin: 0 }}>Renouvellements</h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: '#FEF3C7', padding: '3px 8px', borderRadius: 99 }}>4 à venir</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RENEWALS.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: 9, border: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Expire le {r.date}</div>
                </div>
                <button
                  onClick={() => triggerToast(`Relance envoyée à ${r.name} par SMS !`)}
                  style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: '#FEF3C7', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                >
                  Relancer ({r.days}j)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Absences */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, margin: 0 }}>Absences du jour</h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '3px 8px', borderRadius: 99 }}>3 signalées</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Omar Belhaj', group: 'Anglais B2', time: '10h00', initials: 'OB' },
              { name: 'Yasmine Alami', group: 'Anglais B2', time: '10h00', initials: 'YA' },
              { name: 'Rachid El Fassi', group: 'Français A2', time: '17h00', initials: 'RE' },
            ].map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#F8FAFC', borderRadius: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {a.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: NAVY }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{a.group} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formateurs Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, margin: 0 }}>Rémunération des formateurs</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Juillet 2025 — récapitulatif des honoraires et règlements</p>
          </div>
          <button
            onClick={exportPayrollPDF}
            style={{ fontSize: 12, fontWeight: 700, color: BLUE, background: '#EEF2FF', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}
          >
            Télécharger le bilan PDF
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Formateur', 'Spécialité', 'Heures', 'Taux / h', 'Montant dû', 'Statut', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 11.5, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formateurs.map((f) => {
              const montant = f.heures * f.taux
              return (
                <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: NAVY }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0F2347', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {f.initials}
                      </div>
                      {f.name}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{f.spec}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13.5, fontWeight: 700, color: NAVY }}>{f.heures}h</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{f.taux} DH/h</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: BLUE }}>
                    {montant.toLocaleString('fr-FR')} DH
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: f.paid ? '#065F46' : GOLD, background: f.paid ? '#ECFDF5' : '#FEF3C7', padding: '4px 10px', borderRadius: 99 }}>
                      {f.paid ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => togglePaymentStatus(f.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        color: NAVY,
                        cursor: 'pointer'
                      }}
                    >
                      {f.paid ? 'Marquer non-payé' : 'Valider règlement'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Nouvelle action de direction</h3>
              <button onClick={() => setShowActionModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleActionSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Type d'action</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                >
                  <option value="cohorte">Créer une nouvelle cohorte</option>
                  <option value="prospect">Relance prospect stratégique</option>
                  <option value="formateur">Validation heures formateur</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Titre / Description de l'action</label>
                <input
                  type="text"
                  placeholder="Ex: Cohorte Anglais B2 Soir - Août"
                  value={actionName}
                  onChange={e => setActionName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Valider l'action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
