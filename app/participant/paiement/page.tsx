'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const INITIAL_HISTORY = [
  { id: 1, mois: 'Janvier 2025', montant: 450, date: '01 Jan 2025', methode: 'Virement bancaire', statut: 'Payé', recu: 'Recu_Janvier_2025.pdf' },
  { id: 2, mois: 'Décembre 2024', montant: 450, date: '01 Déc 2024', methode: 'Espèces', statut: 'Payé', recu: 'Recu_Decembre_2024.pdf' },
  { id: 3, mois: 'Novembre 2024', montant: 450, date: '03 Nov 2024', methode: 'Virement bancaire', statut: 'Payé', recu: 'Recu_Novembre_2024.pdf' },
  { id: 4, mois: 'Octobre 2024', montant: 450, date: '01 Oct 2024', methode: 'Espèces', statut: 'Payé', recu: 'Recu_Octobre_2024.pdf' },
  { id: 5, mois: 'Septembre 2024', montant: 450, date: '15 Sep 2024', methode: 'Virement bancaire', statut: 'Payé', recu: 'Recu_Septembre_2024.pdf' },
  { id: 6, mois: 'Février 2025', montant: 450, date: '—', methode: '—', statut: 'En attente', recu: null },
]

export default function PaiementPage() {
  const [history, setHistory] = useState(INITIAL_HISTORY)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'virement' | 'carte' | 'especes'>('virement')
  const [toast, setToast] = useState<string | null>(null)
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const downloadReceipt = (recuName: string, month: string) => {
    const textContent = `EDUOS MAROC - REÇU DE PAIEMENT\n` +
      `----------------------------------------\n` +
      `Apprenant: Yasmine Benali\n` +
      `Formation: Anglais B2 Intermédiaire\n` +
      `Mois: ${month}\n` +
      `Montant: 450 DH (TTC)\n` +
      `Statut: Réglé & Confirmé\n` +
      `Organisme: EDUOS MAROC - Hassan, Rabat\n` +
      `----------------------------------------\n` +
      `Merci pour votre confiance!`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = recuName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Téléchargement de ${recuName} démarré !`)
  }

  const downloadAllStatements = () => {
    const content = `EDUOS MAROC - RELEVÉ GLOBAL DE PAIEMENT\n` +
      `Apprenant: Yasmine Benali\n` +
      `Dernière mise à jour: 2025\n` +
      `========================================\n` +
      history.map(h => `${h.mois} | ${h.montant} DH | ${h.statut} | ${h.methode}`).join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Releve_Paiements_Yasmine_Benali.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Exportation du relevé complet effectuée.`)
  }

  const copyRIB = () => {
    navigator.clipboard.writeText('MA64 2307 8000 0012 3456 7890 1192')
    triggerToast('N° RIB (CIH Bank) copié dans le presse-papier !')
  }

  const handleOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setShowModal(false)
      setHistory(prev => prev.map(item => {
        if (item.mois === 'Février 2025') {
          return {
            ...item,
            statut: 'Payé',
            methode: 'Carte Bancaire (CMI)',
            date: 'Aujourd\'hui',
            recu: 'Recu_Fevrier_2025.pdf'
          }
        }
        return item
      }))
      triggerToast('Paiement de 450 DH effectué avec succès ! Votre reçu est disponible.')
    }, 1500)
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0F2347',
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
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Mes paiements</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Gérez vos mensualités, réglez vos frais et téléchargez vos reçus officiels.</p>
        </div>
        <button
          onClick={downloadAllStatements}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 9,
            background: '#fff',
            border: '1px solid #E2E8F0',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: NAVY,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter le relevé
        </button>
      </div>

      {/* KPI & Status Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Card 1: Status */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#065F46' }}>Statut : Compte en règle</div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Aucun retard enregistre sur votre cursus</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11.5, color: '#94A3B8', marginBottom: 2 }}>Dernier paiement validé</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: NAVY }}>01 Janvier 2025 — 450 DH</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Méthode : Virement bancaire CIH</div>
          </div>
        </div>

        {/* Card 2: Next Payment */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', borderTop: `4px solid ${GOLD}`, boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Prochaine mensualité</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 34, color: NAVY, lineHeight: 1 }}>450 <span style={{ fontSize: 16, fontWeight: 700 }}>DH</span></div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, background: '#FEF3C7', borderRadius: 99, padding: '4px 12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Échéance : 01 Fév. 2025</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: NAVY,
                color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15,35,71,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Payer maintenant
            </button>
          </div>
        </div>
      </div>

      {/* History table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY }}>Historique des règlements</h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>6 mensualités listées</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Mois', 'Montant', 'Date de règlement', 'Méthode', 'Statut', 'Action'].map((h) => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 11.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const paid = h.statut === 'Payé'
              return (
                <tr key={h.id} style={{ borderBottom: i < history.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: NAVY }}>{h.mois}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: paid ? NAVY : GOLD }}>{h.montant} DH</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{h.date}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{h.methode}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: paid ? '#065F46' : GOLD,
                      background: paid ? '#ECFDF5' : '#FEF3C7',
                      borderRadius: 99,
                      padding: '4px 12px',
                    }}>
                      {h.statut}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {paid ? (
                      <button
                        onClick={() => downloadReceipt(h.recu || `Recu_${h.mois}.pdf`, h.mois)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 7,
                          border: '1px solid #CBD5E1',
                          background: '#fff',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: NAVY,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Reçu PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowModal(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 7,
                          border: 'none',
                          background: GOLD,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        Régler
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 35, 71, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, margin: 0 }}>Règlement de la mensualité</h3>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Montant à payer : <strong style={{ color: '#F59E0B' }}>450 DH</strong> (Février 2025)</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', opacity: 0.8 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              {[
                { id: 'virement', label: 'Virement bancaire' },
                { id: 'carte', label: 'Carte bancaire' },
                { id: 'especes', label: 'Espèces (Agence)' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    flex: 1,
                    padding: '12px 10px',
                    border: 'none',
                    borderBottom: activeTab === t.id ? `3px solid ${NAVY}` : '3px solid transparent',
                    background: activeTab === t.id ? '#fff' : 'transparent',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: activeTab === t.id ? 800 : 600,
                    fontSize: 13,
                    color: activeTab === t.id ? NAVY : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24 }}>
              {activeTab === 'virement' && (
                <div>
                  <p style={{ fontSize: 13, color: '#475569', marginBottom: 16, lineHeight: 1.5 }}>
                    Effectuez votre virement vers le compte bancaire officiel d'<strong>EDUOS MAROC</strong> ci-dessous. Mentionnez votre nom et code participant en motif.
                  </p>
                  
                  <div style={{ background: '#F1F5F9', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Banque</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: NAVY, marginBottom: 8 }}>CIH BANK — Agence Rabat Hassan</div>

                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Numéro RIB</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                      <span>MA64 2307 8000 0012 3456 7890 1192</span>
                    </div>
                  </div>

                  <button
                    onClick={copyRIB}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 9,
                      border: `1.5px solid ${BLUE}`,
                      background: '#fff',
                      color: BLUE,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copier le RIB bancaire
                  </button>

                  <div style={{ marginTop: 16, fontSize: 11.5, color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                    Une fois le virement émis, la validation s'effectue sous 24h ouvrées.
                  </div>
                </div>
              )}

              {activeTab === 'carte' && (
                <form onSubmit={handleOnlinePayment}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Numéro de Carte Bancaire</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Expiration (MM/AA)</label>
                      <input
                        type="text"
                        placeholder="12/27"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>CVC / CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 9,
                      border: 'none',
                      background: isProcessing ? '#94A3B8' : BLUE,
                      color: '#fff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: isProcessing ? 'wait' : 'pointer'
                    }}
                  >
                    {isProcessing ? 'Traitement sécurisé en cours...' : 'Payer 450 DH de façon sécurisée'}
                  </button>
                </form>
              )}

              {activeTab === 'especes' && (
                <div>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 14 }}>
                    Vous pouvez régler directement en espèces au secrétariat de notre centre aux horaires d'ouverture :
                  </p>

                  <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, color: NAVY, fontSize: 14, marginBottom: 4 }}>EDUOS MAROC — Rabat Hassan</div>
                    <div style={{ fontSize: 12.5, color: '#64748b' }}>Avenue Fal Ould Oumeir, Rabat</div>
                    <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>Horaires : Lundi à Samedi — 08h30 à 18h30</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowModal(false)
                      triggerToast('Note enregistrée : Merci de vous présenter au secrétariat.')
                    }}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 9,
                      border: 'none',
                      background: NAVY,
                      color: '#fff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Fermer et régler sur place
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
