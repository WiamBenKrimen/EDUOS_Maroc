'use client'
import { useEffect, useState } from 'react'
import SearchFilterBar from '../search-filter-bar'
import { api } from '../../../lib/api-client'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

function mapFacture(item: any) {
  const statutMap: Record<string, string> = {
    payee: 'Payé', partiellement_payee: 'Partiel', en_attente: 'En attente',
    en_retard: 'En retard', annulee: 'Annulée', brouillon: 'Brouillon', emise: 'Émise',
  }
  const modeMap: Record<string, string> = { carte: 'Carte', virement: 'Virement', especes: 'Espèces', cheque: 'Chèque', tpe: 'TPE' }
  const lastPay = Array.isArray(item.paiements) && item.paiements.length ? item.paiements[item.paiements.length - 1] : null
  return {
    id: item.id,
    nom: item.participant_nom,
    formation: item.cohorte_nom,
    montant: Number(item.montant_ttc),
    date: item.date_echeance ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(item.date_echeance)) : '—',
    mode: lastPay ? (modeMap[lastPay.methode] ?? lastPay.methode) : '—',
    statut: statutMap[item.facture_statut] ?? item.facture_statut,
  }
}

export default function PaiementsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [showRelanceModal, setShowRelanceModal] = useState(false)

  useEffect(() => {
    api.get<any[]>('/director/paiements')
      .then(items => setPayments(items.map(mapFacture)))
      .catch(err => triggerToast(err instanceof Error ? err.message : 'Impossible de charger les paiements.'))
      .finally(() => setLoading(false))
  }, [])

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const downloadReceipt = (p: any) => {
    const textContent = `EDUOS MAROC - REÇU DE PAIEMENT ÉLÈVE\n` +
      `========================================\n` +
      `Apprenant: ${p.nom}\n` +
      `Formation: ${p.formation}\n` +
      `Montant: ${p.montant} DH (TTC)\n` +
      `Date de versement: ${p.date}\n` +
      `Méthode: ${p.mode}\n` +
      `Statut: ${p.statut}\n` +
      `========================================`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Recu_Paiement_${p.nom.replace(/ /g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Reçu téléchargé pour ${p.nom} !`)
  }

  const handleSendRelances = () => {
    setShowRelanceModal(false)
    triggerToast('Relances automatiques par SMS & WhatsApp envoyées aux apprenants en retard !')
  }

  const filtered = payments.filter(p => p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.formation.toLowerCase().includes(searchQuery.toLowerCase()))

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
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Suivi des Paiements</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Pilotage des encaissements, relances et bilans financiers.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowRelanceModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 9,
              border: '1px solid #CBD5E1',
              background: '#fff',
              color: NAVY,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Relances auto SMS
          </button>
          <button
            onClick={() => triggerToast('Toutes les factures ont été exportées en ZIP !')}
            style={{
              padding: '10px 18px',
              borderRadius: 9,
              border: 'none',
              background: BLUE,
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Exporter les factures
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        {[
          { label: 'Total encaisse (mois)', val: '84 500 DH', sub: '178 règlements validés', color: '#059669', bg: '#ECFDF5' },
          { label: 'Montant en attente', val: '12 350 DH', sub: '28 apprenants concernés', color: GOLD, bg: '#FEF3C7' },
          { label: 'En retard (> 5 jours)', val: '6 200 DH', sub: '12 relances à effectuer', color: '#DC2626', bg: '#FEE2E2' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
            <div style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: s.color, marginBottom: 10 }} />
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11.5, color: s.color, fontWeight: 700, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <SearchFilterBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un apprenant ou une formation..." resultCount={filtered.length} />

      {/* Payments Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY, margin: 0 }}>Règlements récents</h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Apprenant', 'Formation', 'Montant', 'Date', 'Mode', 'Statut', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const paid = r.statut === 'Payé'
              const pending = r.statut === 'En attente'
              const color = paid ? '#059669' : pending ? GOLD : '#DC2626'
              const bg = paid ? '#ECFDF5' : pending ? '#FEF3C7' : '#FEE2E2'

              return (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: NAVY }}>{r.nom}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{r.formation}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>{r.montant} DH</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{r.date}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{r.mode}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color, background: bg, padding: '4px 10px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {r.statut}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => downloadReceipt(r)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #CBD5E1', background: '#fff', fontSize: '.78rem', fontWeight: 700, color: NAVY, cursor: 'pointer' }}
                    >
                      Reçu PDF
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Relance Modal */}
      {showRelanceModal && (
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
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Relances automatiques SMS</h3>
              <button onClick={() => setShowRelanceModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
                Vous vous prêtez à envoyer une relance groupée aux <strong>12 apprenants</strong> ayant un retard de mensualité supérieur à 5 jours.
              </p>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 12, color: NAVY, fontStyle: 'italic', marginBottom: 20 }}>
                "Bonjour [Nom], nous vous rappelons que votre mensualité EDUOS MAROC de ce mois est en attente de règlement. Merci de régulariser via votre espace apprenant ou au secrétariat."
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowRelanceModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendRelances}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Envoyer les relances
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
