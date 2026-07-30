'use client'
import { useState } from 'react'
import SearchFilterBar from '../search-filter-bar'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const INITIAL_RENOUVELLEMENTS = [
  { id: 1, nom: 'Ahmed Cherkaoui', telephone: '212661234501', formation: 'Anglais B1', expiration: '31 août 2025', jours: 39, action: 'Contacté' },
  { id: 2, nom: 'Fatima Zahra El Idrissi', telephone: '212661234502', formation: 'Français B2', expiration: '15 août 2025', jours: 23, action: 'En attente' },
  { id: 3, nom: 'Karim Ouali', telephone: '212661234503', formation: 'Anglais B2', expiration: '10 août 2025', jours: 18, action: 'Intéressé' },
  { id: 4, nom: 'Sara Benali', telephone: '212661234504', formation: 'Gestion de projet', expiration: '05 août 2025', jours: 13, action: 'En attente' },
  { id: 5, nom: 'Omar Tahiri', telephone: '212661234505', formation: 'Marketing digital', expiration: '01 août 2025', jours: 9, action: 'Urgent' },
  { id: 6, nom: 'Nour El Houda Fassi', telephone: '212661234506', formation: 'Français A2', expiration: '28 juil. 2025', jours: 5, action: 'Urgent' },
  { id: 7, nom: 'Yasmine Ait Ouali', telephone: '212661234507', formation: 'Espagnol débutant', expiration: '25 juil. 2025', jours: 2, action: 'Urgent' },
  { id: 8, nom: 'Mehdi Bensouda', telephone: '212661234508', formation: 'Anglais B1', expiration: '20 sept. 2025', jours: 59, action: 'Programmé' },
]

function joursColor(j: number) {
  if (j <= 7) return { color: '#DC2626', bg: '#FEE2E2' }
  if (j <= 14) return { color: GOLD, bg: '#FEF3C7' }
  if (j <= 30) return { color: BLUE, bg: '#EEF2FF' }
  return { color: '#059669', bg: '#ECFDF5' }
}

const ACTION_MAP: Record<string, { color: string; bg: string }> = {
  'Urgent': { color: '#DC2626', bg: '#FEE2E2' },
  'En attente': { color: GOLD, bg: '#FEF3C7' },
  'Contacté': { color: BLUE, bg: '#EEF2FF' },
  'Intéressé': { color: '#7C3AED', bg: '#F3E8FF' },
  'Programmé': { color: '#059669', bg: '#ECFDF5' },
  'Renouvelé': { color: '#059669', bg: '#ECFDF5' },
}

export default function RenouvellemmentsPage() {
  const [renouvellements, setRenouvellements] = useState(INITIAL_RENOUVELLEMENTS)
  const [toast, setToast] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRenewal, setSelectedRenewal] = useState<(typeof INITIAL_RENOUVELLEMENTS)[number] | null>(null)
  const [duration, setDuration] = useState('6')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('1200')

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleWhatsApp = (renewal: (typeof INITIAL_RENOUVELLEMENTS)[number]) => {
    const message = `Bonjour ${renewal.nom}, votre cycle ${renewal.formation} arrive à échéance le ${renewal.expiration}. Souhaitez-vous renouveler votre inscription ? L’équipe EDUOS Maroc reste à votre disposition.`
    window.open(`https://wa.me/${renewal.telephone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setRenouvellements(prev => prev.map(item => item.id === renewal.id ? { ...item, action: 'Contacté' } : item))
    triggerToast(`Conversation WhatsApp ouverte pour ${renewal.nom}.`)
  }

  const handleRenew = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedRenewal) return
    const endDate = new Date(`${startDate}T12:00:00`)
    endDate.setMonth(endDate.getMonth() + Number(duration))
    const formattedDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(endDate)
    setRenouvellements(prev => prev.map(item => item.id === selectedRenewal.id ? { ...item, action: 'Renouvelé', jours: Number(duration) * 30, expiration: formattedDate } : item))
    triggerToast(`Renouvellement de ${selectedRenewal.nom} validé pour ${duration} mois · ${amount} DH.`)
    setSelectedRenewal(null)
  }

  const handleSendAllRelances = () => {
    triggerToast('Relances envoyées à tous les apprenants dont le contrat expire sous 30j !')
  }

  const filtered = renouvellements.filter(r =>
    r.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.formation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const urgentCount = filtered.filter(r => r.jours <= 7).length
  const toTreatCount = filtered.filter(r => r.jours <= 30).length
  const renewedCount = filtered.filter(r => r.action === 'Renouvelé').length

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
      <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Gestion des Renouvellements</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Suivez les fins de cycles et anticipez les réinscriptions d'apprenants.</p>
        </div>
        <button
          onClick={handleSendAllRelances}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 9,
            border: 'none',
            background: GOLD,
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217,119,6,0.2)'
          }}
        >
          Envoyer toutes les relances
        </button>
        </div>
      </div>
      <SearchFilterBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un apprenant ou une formation..." resultCount={filtered.length} />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Urgents (≤ 7j)', val: urgentCount, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'À traiter (≤ 30j)', val: toTreatCount, color: GOLD, bg: '#FEF3C7' },
          { label: 'Renouvelés ce mois', val: renewedCount + 14, color: '#059669', bg: '#ECFDF5' },
          { label: 'Taux de réinscription', val: '86 %', color: BLUE, bg: '#EEF2FF' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: s.color, marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p style={{ fontSize: 14, margin: '8px 0' }}>Aucun renouvellement trouvé</p>
        </div>
      ) : (
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {["Apprenant", "Formation", "Expiration", "Jours restants", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const jc = joursColor(r.jours)
              const ac = ACTION_MAP[r.action] ?? { color: '#64748b', bg: '#F1F5F9' }
              return (
                <tr key={r.id} style={{ borderBottom: i < renouvellements.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F1F5F9', color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {r.nom.charAt(0)}
                      </div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.88rem', color: NAVY }}>{r.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{r.formation}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{r.expiration}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '.75rem', fontWeight: 800, color: jc.color, background: jc.bg, padding: '4px 10px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {r.jours} jours
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: ac.color, background: ac.bg, padding: '4px 10px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {r.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleWhatsApp(r)}
                        style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #CBD5E1', background: '#fff', fontSize: '.78rem', fontWeight: 700, color: NAVY, cursor: 'pointer' }}
                      >
                        WhatsApp
                      </button>

                      {r.action !== 'Renouvelé' && (
                        <button
                          onClick={() => setSelectedRenewal(r)}
                          style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: BLUE, fontSize: '.78rem', fontWeight: 800, color: '#fff', cursor: 'pointer' }}
                        >
                          Renouveler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}

      {selectedRenewal && (
        <div className="renew-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRenewal(null)}>
          <section className="renew-modal" role="dialog" aria-modal="true" aria-labelledby="renew-title" onMouseDown={event => event.stopPropagation()}>
            <header>
              <div>
                <span>Nouvelle réinscription</span>
                <h2 id="renew-title">Renouveler {selectedRenewal.nom}</h2>
                <p>{selectedRenewal.formation}</p>
              </div>
              <button type="button" onClick={() => setSelectedRenewal(null)} aria-label="Fermer">×</button>
            </header>
            <form onSubmit={handleRenew}>
              <label>
                Durée du nouveau cycle
                <select value={duration} onChange={event => setDuration(event.target.value)}>
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                </select>
              </label>
              <label>
                Date de début
                <input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} required/>
              </label>
              <label>
                Montant convenu
                <span className="renew-amount"><input type="number" min="0" step="50" value={amount} onChange={event => setAmount(event.target.value)} required/><b>DH</b></span>
              </label>
              <div className="renew-summary">
                <span>Nouveau cycle</span>
                <strong>{duration} mois · {Number(amount || 0).toLocaleString('fr-FR')} DH</strong>
              </div>
              <footer>
                <button type="button" onClick={() => setSelectedRenewal(null)}>Annuler</button>
                <button type="submit">Confirmer le renouvellement</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
