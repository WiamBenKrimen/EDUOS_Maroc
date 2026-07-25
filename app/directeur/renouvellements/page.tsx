'use client'

const RENOUVELLEMENTS = [
  { nom: 'Ahmed Cherkaoui', formation: 'Anglais B1', expiration: '31 août 2025', jours: 39, action: 'Contacté' },
  { nom: 'Fatima Zahra El Idrissi', formation: 'Français B2', expiration: '15 août 2025', jours: 23, action: 'En attente' },
  { nom: 'Karim Ouali', formation: 'Anglais B2', expiration: '10 août 2025', jours: 18, action: 'Intéressé' },
  { nom: 'Sara Benali', formation: 'Gestion de projet', expiration: '05 août 2025', jours: 13, action: 'En attente' },
  { nom: 'Omar Tahiri', formation: 'Marketing digital', expiration: '01 août 2025', jours: 9, action: 'Urgent' },
  { nom: 'Nour El Houda Fassi', formation: 'Français A2', expiration: '28 juil. 2025', jours: 5, action: 'Urgent' },
  { nom: 'Yasmine Ait Ouali', formation: 'Espagnol débutant', expiration: '25 juil. 2025', jours: 2, action: 'Urgent' },
  { nom: 'Mehdi Bensouda', formation: 'Anglais B1', expiration: '20 sept. 2025', jours: 59, action: 'Programmé' },
]

function joursColor(j: number) {
  if (j <= 7) return { color: '#DC2626', bg: 'rgba(220,38,38,.08)' }
  if (j <= 14) return { color: '#C9922A', bg: 'rgba(201,146,42,.1)' }
  if (j <= 30) return { color: '#1B3A6B', bg: 'rgba(27,58,107,.07)' }
  return { color: '#059669', bg: 'rgba(5,150,105,.07)' }
}

const ACTION_MAP: Record<string, { color: string; bg: string }> = {
  'Urgent': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
  'En attente': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  'Contacté': { color: '#1B3A6B', bg: 'rgba(27,58,107,.07)' },
  'Intéressé': { color: '#7C3AED', bg: 'rgba(124,58,237,.07)' },
  'Programmé': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
}

export default function RenouvellemmentsPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Renouvellements</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Suivez les contrats arrivant à expiration</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#C9922A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          Envoyer toutes les relances
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Urgents (≤ 7j)', val: '3', color: '#DC2626' },
          { label: 'À traiter (≤ 30j)', val: '7', color: '#C9922A' },
          { label: 'Programmés', val: '1', color: '#059669' },
          { label: 'Renouvelés ce mois', val: '14', color: '#1B3A6B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E2D9CC', boxShadow: '0 1px 6px rgba(27,58,107,.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: s.color, marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {["Apprenant", "Formation", "Date d'expiration", "Jours restants", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RENOUVELLEMENTS.sort((a, b) => a.jours - b.jours).map((r, i) => {
              const jc = joursColor(r.jours)
              const ac = ACTION_MAP[r.action] ?? { color: '#64748b', bg: '#f1f5f9' }
              return (
                <tr key={i} style={{ borderBottom: i < RENOUVELLEMENTS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E2D9CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#1B3A6B' }}>{r.nom.charAt(0)}</div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.87rem', color: '#1a1823' }}>{r.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b' }}>{r.formation}</td>
                  <td style={{ padding: '14px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#374151', fontWeight: 500 }}>{r.expiration}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 99, background: jc.bg, color: jc.color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.78rem' }}>{r.jours} jours</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: ac.bg, color: ac.color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{r.action}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.74rem', color: '#1B3A6B', cursor: 'pointer' }}>WhatsApp</button>
                      <button style={{ padding: '6px 12px', borderRadius: 7, border: '1.5px solid #1B3A6B', background: '#1B3A6B', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.74rem', cursor: 'pointer' }}>Renouveler</button>
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
