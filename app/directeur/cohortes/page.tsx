'use client'

const COHORTES = [
  { name: 'Anglais B1 — Matin', formateur: 'Karim Alaoui', eleves: 18, max: 20, sessions: 'Lun / Mer / Ven 9h–11h', debut: 'Sept. 2025' },
  { name: 'Français A2 — Soir', formateur: 'Laila Bennouna', eleves: 14, max: 16, sessions: 'Mar / Jeu 18h–20h', debut: 'Oct. 2025' },
  { name: 'Espagnol Débutant', formateur: 'Omar El Fassi', eleves: 12, max: 20, sessions: 'Sam 9h–13h', debut: 'Sept. 2025' },
  { name: 'Gestion de projet', formateur: 'Sanae Tahiri', eleves: 20, max: 20, sessions: 'Lun / Mer 17h–19h', debut: 'Juil. 2025' },
  { name: 'Marketing digital', formateur: 'Youssef Chraibi', eleves: 9, max: 15, sessions: 'Mar / Ven 10h–12h', debut: 'Oct. 2025' },
  { name: 'Anglais C1 — Intensif', formateur: 'Nadia Rami', eleves: 8, max: 10, sessions: 'Lun–Ven 8h–10h', debut: 'Août 2025' },
]

function fillColor(pct: number) {
  if (pct >= 95) return '#059669'
  if (pct >= 70) return '#1B3A6B'
  if (pct >= 50) return '#C9922A'
  return '#DC2626'
}

export default function CohortesPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Cohortes & Groupes</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Gérez vos groupes de formation et leur remplissage</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle cohorte
        </button>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[{ label: 'Groupes actifs', val: '6' }, { label: 'Total élèves', val: '81' }, { label: 'Places libres', val: '20' }, { label: 'Groupes complets', val: '2' }].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #E2D9CC', boxShadow: '0 1px 6px rgba(27,58,107,.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.4rem', color: '#1B3A6B', marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#94a3b8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {COHORTES.map((c, i) => {
          const pct = Math.round((c.eleves / c.max) * 100)
          const col = fillColor(pct)
          return (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #E2D9CC', boxShadow: '0 2px 12px rgba(27,58,107,.05)', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(-3px)'; t.style.boxShadow = '0 10px 30px rgba(27,58,107,.1)' }}
              onMouseLeave={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(0)'; t.style.boxShadow = '0 2px 12px rgba(27,58,107,.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.95rem', color: '#1a1823', lineHeight: 1.3 }}>{c.name}</h3>
                <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 99, background: pct >= 95 ? 'rgba(5,150,105,.08)' : 'rgba(27,58,107,.07)', color: col, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.68rem', flexShrink: 0, marginLeft: 8 }}>{pct}%</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>Remplissage</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.78rem', color: col }}>{c.eleves} / {c.max} élèves</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: '#f1ede8', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: col, transition: 'width .6s ease' }}/>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{c.formateur}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{c.sessions}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>Début : {c.debut}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid #1B3A6B', background: '#fff', color: '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.75rem', cursor: 'pointer' }}>Voir le groupe</button>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#faf8f5', color: '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>Éditer</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
