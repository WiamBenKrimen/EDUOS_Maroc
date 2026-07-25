'use client'

const NAVY = '#1B3A6B'
const NAVY_DARK = '#0F2347'
const GOLD = '#C9922A'

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(27,58,107,.06)',
  border: '1px solid rgba(27,58,107,.07)',
}

const HISTORY = [
  { mois: 'Janvier 2025', montant: 450, date: '1er Jan 2025', methode: 'Virement', statut: 'Payé' },
  { mois: 'Décembre 2024', montant: 450, date: '1er Déc 2024', methode: 'Espèces', statut: 'Payé' },
  { mois: 'Novembre 2024', montant: 450, date: '3 Nov 2024', methode: 'Virement', statut: 'Payé' },
  { mois: 'Octobre 2024', montant: 450, date: '1er Oct 2024', methode: 'Espèces', statut: 'Payé' },
  { mois: 'Septembre 2024', montant: 450, date: '15 Sep 2024', methode: 'Virement', statut: 'Payé' },
  { mois: 'Août 2024', montant: 450, date: '—', methode: '—', statut: 'En attente' },
]

const METHODS = [
  { label: 'Virement bancaire', desc: 'CIH · Attijariwafa · BMCE', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', color: NAVY, bg: 'rgba(27,58,107,.08)' },
  { label: 'Espèces', desc: 'Au secrétariat du centre', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', color: '#059669', bg: 'rgba(5,150,105,.08)' },
  { label: 'Paiement en ligne', desc: 'CMI · PayDunya · Bientôt disponible', icon: 'M1 4h22v16H1z M1 10h22', color: GOLD, bg: 'rgba(201,146,42,.08)' },
]

export default function PaiementPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 26, color: NAVY_DARK, marginBottom: 4 }}>Mes paiements</h1>
        <p style={{ fontSize: 13.5, color: '#64748b' }}>Gérez vos mensualités et téléchargez vos reçus · Anglais B2</p>
      </div>

      {/* Status + Next payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
        {/* Status */}
        <div style={{ ...CARD_STYLE, padding: '24px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#059669' }}>Statut : À jour</div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Aucun retard de paiement</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(5,150,105,.05)', borderRadius: 9 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>Dernière mensualité payée</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1823' }}>1er Janvier 2025 — 450 DH</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Méthode : Virement bancaire</div>
          </div>
        </div>

        {/* Next payment */}
        <div style={{ ...CARD_STYLE, padding: '24px', borderTop: `4px solid ${GOLD}` }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Prochaine mensualité</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 36, color: NAVY_DARK, letterSpacing: '-1px', lineHeight: 1 }}>450 <span style={{ fontSize: 18, fontWeight: 600 }}>DH</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>1er Février 2025</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, background: 'rgba(201,146,42,.1)', borderRadius: 99, padding: '2px 10px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dans 12 jours</span>
          </div>
          <button style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,58,107,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Payer maintenant
          </button>
        </div>
      </div>

      {/* Payment methods */}
      <div style={{ ...CARD_STYLE, padding: '24px', marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: NAVY_DARK, marginBottom: 18 }}>Modes de paiement acceptés</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {METHODS.map((m) => (
            <div key={m.label} style={{ padding: '18px 16px', borderRadius: 11, background: m.bg, border: `1px solid ${m.color}18`, textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round"><path d={m.icon}/></svg>
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: '#1a1823', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History table */}
      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(27,58,107,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: NAVY_DARK }}>Historique des paiements</h2>
          <button style={{ fontSize: 12.5, fontWeight: 600, color: NAVY, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Télécharger tout</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F6F8' }}>
              {['Mois', 'Montant', 'Date de paiement', 'Méthode', 'Statut', ''].map((h) => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 11.5, color: '#64748b', letterSpacing: '0.3px', textTransform: 'uppercase', borderBottom: '1px solid rgba(27,58,107,.08)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h, i) => {
              const paid = h.statut === 'Payé'
              return (
                <tr key={h.mois} style={{ borderBottom: i < HISTORY.length - 1 ? '1px solid rgba(27,58,107,.05)' : 'none' }}>
                  <td style={{ padding: '14px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13.5, color: '#1a1823' }}>{h.mois}</td>
                  <td style={{ padding: '14px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: paid ? '#1a1823' : GOLD }}>{h.montant} DH</td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: '#64748b' }}>{h.date}</td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: '#64748b' }}>{h.methode}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: paid ? '#059669' : GOLD,
                      background: paid ? 'rgba(5,150,105,.1)' : 'rgba(201,146,42,.1)',
                      borderRadius: 99, padding: '4px 12px',
                    }}>{h.statut}</span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    {paid && (
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(27,58,107,.12)', background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 12, color: NAVY, cursor: 'pointer' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Reçu PDF
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
