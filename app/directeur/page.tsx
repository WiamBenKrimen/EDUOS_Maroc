'use client'

const NAVY = '#1B3A6B'
const GOLD = '#C9922A'

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 12,
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(27,58,107,.06)',
  border: '1px solid rgba(27,58,107,.07)',
}

const STAT_CARDS = [
  {
    label: 'Élèves inscrits',
    value: '347',
    trend: '+12 ce mois',
    trendColor: '#059669',
    trendBg: 'rgba(5,150,105,.1)',
    iconBg: 'rgba(27,58,107,.1)',
    iconColor: NAVY,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'CA encaissé (mois)',
    value: '84 200 DH',
    trend: '+8.4% vs mois dernier',
    trendColor: '#059669',
    trendBg: 'rgba(5,150,105,.1)',
    iconBg: 'rgba(5,150,105,.1)',
    iconColor: '#059669',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Mensualités en retard',
    value: '23',
    trend: '-3 vs semaine dernière',
    trendColor: '#DC2626',
    trendBg: 'rgba(220,38,38,.1)',
    iconBg: 'rgba(220,38,38,.08)',
    iconColor: '#DC2626',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Présence globale',
    value: '87%',
    trend: 'Stable ce mois',
    trendColor: '#64748b',
    trendBg: 'rgba(100,116,139,.1)',
    iconBg: 'rgba(201,146,42,.1)',
    iconColor: GOLD,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

const GROUPS = [
  { name: 'Anglais B2', detail: '18/20 élèves', pct: 90 },
  { name: 'Français A2 Soir', detail: '14/18 élèves', pct: 78 },
  { name: 'Espagnol Débutant', detail: '11/15 élèves', pct: 73 },
  { name: 'Maths Avancés', detail: '19/20 élèves', pct: 95 },
]

const RENEWALS = [
  { name: 'Karim Ouali', date: '28 Jan', days: 3 },
  { name: 'Sara El Mansouri', date: '31 Jan', days: 6 },
  { name: 'Nour Chraibi', date: '5 Fév', days: 11 },
  { name: 'Ahmed Tahiri', date: '10 Fév', days: 16 },
  { name: 'Hind Berrada', date: '18 Fév', days: 24 },
]

const ABSENCES = [
  { name: 'Omar Belhaj', group: 'Anglais B2', time: '10h00' },
  { name: 'Yasmine Alami', group: 'Anglais B2', time: '10h00' },
  { name: 'Rachid El Fassi', group: 'Français A2', time: '17h00' },
  { name: 'Fatima Zahra', group: 'Espagnol Déb.', time: '14h00' },
]

const FORMATEURS = [
  { name: 'Karim Alaoui', spec: 'Anglais', heures: 32, taux: 120, statut: 'Payé' },
  { name: 'Leila Bennouna', spec: 'Français', heures: 24, taux: 110, statut: 'En attente' },
  { name: 'Omar El Fassi', spec: 'Espagnol', heures: 20, taux: 100, statut: 'Payé' },
  { name: 'Sanaa Tahiri', spec: 'Management', heures: 28, taux: 130, statut: 'En attente' },
]

function DaysTag({ days }: { days: number }) {
  const color = days < 7 ? '#DC2626' : days < 14 ? '#C9922A' : '#059669'
  const bg = days < 7 ? 'rgba(220,38,38,.1)' : days < 14 ? 'rgba(201,146,42,.1)' : 'rgba(5,150,105,.1)'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 99, padding: '2px 9px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {days}j
    </span>
  )
}

export default function DirecteurDashboard() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 26, color: '#0F2347', marginBottom: 4 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b' }}>Vendredi 25 juillet 2025 · Vue d'ensemble de votre centre de formation</p>
      </div>

      {/* Row 1 — KPI stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 22 }}>
        {STAT_CARDS.map((card) => (
          <div key={card.label} style={{ ...CARD_STYLE }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.iconColor }}>
                {card.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: card.trendColor, background: card.trendBg, borderRadius: 99, padding: '3px 10px', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>
                {card.trend}
              </span>
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 28, color: '#0F2347', letterSpacing: '-0.5px', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Row 2 — 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 22 }}>
        {/* Groupes actifs */}
        <div style={{ ...CARD_STYLE }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0F2347' }}>Groupes actifs</h2>
            <span style={{ fontSize: 11, color: '#64748b' }}>4 groupes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {GROUPS.map((g) => (
              <div key={g.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1823' }}>{g.name}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{g.detail}</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: 'rgba(27,58,107,.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, borderRadius: 4, background: g.pct >= 90 ? GOLD : NAVY, transition: 'width .5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Renouvellements à venir */}
        <div style={{ ...CARD_STYLE }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0F2347' }}>Renouvellements</h2>
            <span style={{ fontSize: 11, color: '#64748b' }}>5 à venir</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RENEWALS.map((r, i) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < RENEWALS.length - 1 ? '1px solid rgba(27,58,107,.06)' : 'none' }}>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1823' }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>Expire le {r.date}</div>
                </div>
                <DaysTag days={r.days} />
              </div>
            ))}
          </div>
        </div>

        {/* Absences du jour */}
        <div style={{ ...CARD_STYLE }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0F2347' }}>Absences du jour</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: 'rgba(220,38,38,.1)', borderRadius: 99, padding: '2px 9px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>4</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ABSENCES.map((a, i) => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < ABSENCES.length - 1 ? '1px solid rgba(27,58,107,.06)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(220,38,38,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12, color: '#DC2626', flexShrink: 0 }}>
                  {a.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#1a1823', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{a.group} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 — Rémunération formateurs */}
      <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#0F2347', marginBottom: 3 }}>Rémunération formateurs</h2>
            <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Juillet 2025 — récapitulatif des heures et montants dus</p>
          </div>
          <button style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${NAVY}`, background: 'transparent', color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            Exporter PDF
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Formateur', 'Spécialité', 'Heures ce mois', 'Taux / heure', 'Montant dû', 'Statut'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 11.5, color: '#64748b', letterSpacing: '0.3px', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(27,58,107,.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATEURS.map((f, i) => {
                const montant = f.heures * f.taux
                const paid = f.statut === 'Payé'
                return (
                  <tr key={f.name} style={{ borderBottom: i < FORMATEURS.length - 1 ? '1px solid rgba(27,58,107,.05)' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(27,58,107,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 12, color: NAVY }}>
                          {f.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13.5, color: '#1a1823' }}>{f.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{f.spec}</td>
                    <td style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1823' }}>{f.heures}h</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{f.taux} DH/h</td>
                    <td style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>{montant.toLocaleString('fr-FR')} DH</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: paid ? '#059669' : '#C9922A',
                        background: paid ? 'rgba(5,150,105,.1)' : 'rgba(201,146,42,.1)',
                        borderRadius: 99, padding: '4px 12px',
                      }}>{f.statut}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ borderTop: '1px solid rgba(27,58,107,.07)', marginTop: 8, paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 32 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>Total heures</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#1a1823' }}>104h</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>Montant total dû</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 18, color: NAVY }}>12 440 DH</div>
          </div>
        </div>
      </div>
    </div>
  )
}
