'use client'

const REMUNERATIONS = [
  { formateur: 'Karim Alaoui', specialite: 'Anglais', heures: 48, tauxHoraire: 120, total: 5760, statut: 'Calculé' },
  { formateur: 'Laila Bennouna', specialite: 'Français', heures: 36, tauxHoraire: 110, total: 3960, statut: 'Calculé' },
  { formateur: 'Omar El Fassi', specialite: 'Espagnol & Arabe', heures: 24, tauxHoraire: 115, total: 2760, statut: 'Calculé' },
  { formateur: 'Sanae Tahiri', specialite: 'Management', heures: 32, tauxHoraire: 150, total: 4800, statut: 'En attente' },
  { formateur: 'Youssef Chraibi', specialite: 'Marketing digital', heures: 20, tauxHoraire: 130, total: 2600, statut: 'En attente' },
  { formateur: 'Nadia Rami', specialite: 'Anglais intensif', heures: 40, tauxHoraire: 140, total: 5600, statut: 'Payé' },
]

export default function RemunerationsPage() {
  const totalMois = REMUNERATIONS.reduce((s, r) => s + r.total, 0)

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <nav style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8', marginBottom: 8 }}>
            <span>Formateurs</span><span style={{ margin: '0 6px' }}>›</span><span style={{ color: '#1B3A6B' }}>Rémunérations</span>
          </nav>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Rémunérations</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Calcul des rémunérations formateurs — Juillet 2025</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
            <option>Juillet 2025</option>
            <option>Juin 2025</option>
            <option>Mai 2025</option>
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total à payer ce mois', val: `${totalMois.toLocaleString('fr-MA')} DH`, color: '#1B3A6B' },
          { label: 'Heures total formateurs', val: `${REMUNERATIONS.reduce((s,r) => s + r.heures, 0)} h`, color: '#C9922A' },
          { label: 'Rémunérations payées', val: `${REMUNERATIONS.filter(r => r.statut === 'Payé').reduce((s,r) => s + r.total, 0).toLocaleString('fr-MA')} DH`, color: '#059669' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E2D9CC', boxShadow: '0 1px 6px rgba(27,58,107,.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.4rem', color: s.color, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.77rem', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['Formateur', 'Spécialité', 'Heures effectuées', 'Taux horaire', 'Total brut', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REMUNERATIONS.map((r, i) => {
              const sm: Record<string, { color: string; bg: string }> = {
                'Payé': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
                'Calculé': { color: '#1B3A6B', bg: 'rgba(27,58,107,.07)' },
                'En attente': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
              }
              const { color, bg } = sm[r.statut] ?? { color: '#64748b', bg: '#f1f5f9' }
              return (
                <tr key={i} style={{ borderBottom: i < REMUNERATIONS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823' }}>{r.formateur}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b' }}>{r.specialite}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.88rem', color: '#374151' }}>{r.heures} h</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b' }}>{r.tauxHoraire} DH/h</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '.95rem', color: '#1B3A6B' }}>{r.total.toLocaleString('fr-MA')} DH</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: bg, color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{r.statut}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#1B3A6B', cursor: 'pointer' }}>Détails</button>
                      {r.statut !== 'Payé' && <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #059669', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#059669', cursor: 'pointer' }}>Marquer payé</button>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#faf8f5', borderTop: '2px solid #E2D9CC' }}>
              <td colSpan={4} style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.88rem', color: '#1a1823' }}>Total du mois</td>
              <td style={{ padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1rem', color: '#1B3A6B' }}>{totalMois.toLocaleString('fr-MA')} DH</td>
              <td colSpan={2}/>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
