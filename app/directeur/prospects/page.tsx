'use client'

const PROSPECTS = [
  { nom: 'Yasmine Ait Ouali', formation: 'Anglais B1', contact: '14 juil. 2025', statut: 'Nouveau', color: '#1B3A6B', bg: 'rgba(27,58,107,.07)' },
  { nom: 'Mehdi Bensouda', formation: 'Espagnol débutant', contact: '12 juil. 2025', statut: 'En cours', color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  { nom: 'Nour El Houda Fassi', formation: 'Français B2', contact: '10 juil. 2025', statut: 'Inscrit', color: '#059669', bg: 'rgba(5,150,105,.08)' },
  { nom: 'Amine Rachidi', formation: 'Gestion de projet', contact: '08 juil. 2025', statut: 'En cours', color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  { nom: 'Sara El Ouafi', formation: 'Marketing digital', contact: '05 juil. 2025', statut: 'Inscrit', color: '#059669', bg: 'rgba(5,150,105,.08)' },
  { nom: 'Khalid Mansouri', formation: 'Comptabilité', contact: '02 juil. 2025', statut: 'Perdu', color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
  { nom: 'Fatima Benali', formation: 'Anglais C1', contact: '28 juin 2025', statut: 'Nouveau', color: '#1B3A6B', bg: 'rgba(27,58,107,.07)' },
  { nom: 'Omar Tahiri', formation: 'Informatique bureautique', contact: '25 juin 2025', statut: 'En cours', color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
]

export default function ProspectsPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Prospects</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Gérez et suivez vos contacts commerciaux</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau prospect
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input placeholder="Rechercher un prospect…" style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', outline: 'none', width: 260, background: '#fff' }} />
        {['Tous', 'Nouveau', 'En cours', 'Inscrit', 'Perdu'].map(s => (
          <button key={s} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E2D9CC', background: s === 'Tous' ? '#1B3A6B' : '#fff', color: s === 'Tous' ? '#fff' : '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.78rem', cursor: 'pointer' }}>{s}</button>
        ))}
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option>Toutes les formations</option>
          <option>Anglais</option>
          <option>Français</option>
          <option>Espagnol</option>
          <option>Gestion</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['Nom', 'Formation souhaitée', 'Date de contact', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROSPECTS.map((p, i) => (
              <tr key={i} style={{ borderBottom: i < PROSPECTS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E2D9CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#1B3A6B', flexShrink: 0 }}>
                      {p.nom.charAt(0)}
                    </div>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.88rem', color: '#1a1823' }}>{p.nom}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.85rem', color: '#374151' }}>{p.formation}</td>
                <td style={{ padding: '14px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b' }}>{p.contact}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, background: p.bg, color: p.color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{p.statut}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#1B3A6B', cursor: 'pointer' }}>Voir</button>
                    <button style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#64748b', cursor: 'pointer' }}>Éditer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.8rem', color: '#64748b' }}>Affichage de 8 prospects sur 34</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #E2D9CC', background: n === 1 ? '#1B3A6B' : '#fff', color: n === 1 ? '#fff' : '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
