'use client'

const FACTURES = [
  { num: 'FAC-2025-0142', apprenant: 'Ahmed Cherkaoui', formation: 'Anglais B1', montant: '450 DH', date: '22 juil. 2025', statut: 'Payée' },
  { num: 'FAC-2025-0141', apprenant: 'Fatima Zahra El Idrissi', formation: 'Français B2', montant: '680 DH', date: '21 juil. 2025', statut: 'Payée' },
  { num: 'FAC-2025-0140', apprenant: 'Sara Benali', formation: 'Gestion de projet', montant: '750 DH', date: '18 juil. 2025', statut: 'En attente' },
  { num: 'FAC-2025-0139', apprenant: 'Omar Tahiri', formation: 'Marketing digital', montant: '580 DH', date: '15 juil. 2025', statut: 'En retard' },
  { num: 'FAC-2025-0138', apprenant: 'Nour El Houda Fassi', formation: 'Français A2', montant: '380 DH', date: '10 juil. 2025', statut: 'Payée' },
  { num: 'FAC-2025-0137', apprenant: 'Amine Rachidi', formation: 'Gestion de projet', montant: '750 DH', date: '08 juil. 2025', statut: 'Payée' },
  { num: 'FAC-2025-0136', apprenant: 'Karim Ouali', formation: 'Anglais B2', montant: '520 DH', date: '05 juil. 2025', statut: 'En attente' },
  { num: 'FAC-2025-0135', apprenant: 'Yasmine Ait Ouali', formation: 'Espagnol débutant', montant: '420 DH', date: '01 juil. 2025', statut: 'En retard' },
]

const STATUS_MAP: Record<string, { color: string; bg: string }> = {
  'Payée': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
  'En attente': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  'En retard': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
}

export default function FacturesPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <nav style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8', marginBottom: 8 }}>
            <span>Paiements</span><span style={{ margin: '0 6px' }}>›</span><span style={{ color: '#1B3A6B' }}>Factures</span>
          </nav>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Factures</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Historique complet de toutes les factures</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter CSV
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['Toutes', 'Payée', 'En attente', 'En retard'].map((s, i) => (
          <button key={s} style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${i === 0 ? '#1B3A6B' : '#E2D9CC'}`, background: i === 0 ? '#1B3A6B' : '#fff', color: i === 0 ? '#fff' : '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>
            {s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <input placeholder="Rechercher…" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', outline: 'none', width: 200 }} />
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b', outline: 'none', cursor: 'pointer' }}>
            <option>Juillet 2025</option>
            <option>Juin 2025</option>
            <option>Mai 2025</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['N° Facture', 'Apprenant', 'Formation', 'Montant', 'Date', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACTURES.map((f, i) => {
              const { color, bg } = STATUS_MAP[f.statut] ?? { color: '#64748b', bg: '#f1f5f9' }
              return (
                <tr key={i} style={{ borderBottom: i < FACTURES.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#1B3A6B', fontWeight: 600 }}>{f.num}</td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.85rem', color: '#1a1823' }}>{f.apprenant}</td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#64748b' }}>{f.formation}</td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823' }}>{f.montant}</td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b' }}>{f.date}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: bg, color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{f.statut}</span>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#1B3A6B', cursor: 'pointer' }}>PDF</button>
                      {f.statut !== 'Payée' && <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #DC2626', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#DC2626', cursor: 'pointer' }}>Relancer</button>}
                    </div>
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
