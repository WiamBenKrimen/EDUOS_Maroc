'use client'

const SEANCES = [
  { jour: 'Lun', date: '20', done: true },
  { jour: 'Mer', date: '22', done: true },
  { jour: 'Ven', date: '24', done: true },
  { jour: 'Lun', date: '27', done: false },
  { jour: 'Mer', date: '29', done: false },
]

const NOTIFS = [
  { text: 'Rappel : votre cours est demain à 10h — Salle 1', time: 'Il y a 1h', color: '#1B3A6B', bg: 'rgba(27,58,107,.08)' },
  { text: 'Prochain paiement : 450 DH le 1er Février 2025', time: 'Il y a 4h', color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  { text: 'Nouveaux exercices disponibles : Semaine 4 — Présent perfect', time: 'Hier 14h', color: '#059669', bg: 'rgba(5,150,105,.1)' },
]

const DOCS = [
  { name: 'Attestation de présence', type: 'PDF', date: '10 Jan 2025', iconColor: '#7C3AED' },
  { name: 'Programme Anglais B2', type: 'PDF', date: '2 Jan 2025', iconColor: '#1B3A6B' },
  { name: 'Règlement intérieur', type: 'PDF', date: '1 Jan 2025', iconColor: '#C9922A' },
]

export default function MonEspacePage() {
  const progress = 68

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>EDUOS</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Mon espace</span>
          </div>
          <h1 className="page-title">Bonjour, Yasmine</h1>
          <p className="page-subtitle">Anglais B2 · Groupe du matin · Lundi 25 juillet 2025</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#C9922A,#e8a83a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.8rem', color: '#fff', flexShrink: 0 }}>YB</div>
          <span className="badge badge-green">Formation en cours</span>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(27,58,107,.09)', color: '#1B3A6B' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span className="badge badge-gold">+5% ce mois</span>
          </div>
          <div className="kpi-value">87 %</div>
          <div className="kpi-label">Taux de présence</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(201,146,42,.1)', color: '#C9922A' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
          </div>
          <div className="kpi-value">{progress} %</div>
          <div className="kpi-label">Programme complété</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(5,150,105,.09)', color: '#059669' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <span className="badge badge-green">À jour</span>
          </div>
          <div className="kpi-value">450 DH</div>
          <div className="kpi-label">Prochain paiement</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(124,58,237,.09)', color: '#7C3AED' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div className="kpi-value">24</div>
          <div className="kpi-label">Séances effectuées</div>
        </div>
      </div>

      {/* ── Middle grid ── */}
      <div className="section-grid-3">
        {/* Prochain cours */}
        <div className="card card-p">
          <div className="card-header">
            <h2 className="card-title">Prochain cours</h2>
            <span className="badge badge-navy">Dans 2 jours</span>
          </div>

          <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.8rem', color: '#9AABBC', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
              Lundi 20 Janvier
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.8rem', color: '#1B3A6B', letterSpacing: '-.04em', lineHeight: 1 }}>
              10h00
            </div>
            <div style={{ fontSize: '.8rem', color: '#9AABBC', marginTop: 6 }}>Salle 1 · M. Karimi</div>
          </div>

          <div className="card-divider" />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SEANCES.map((s, i) => (
              <div key={i} className="row-between">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '.8rem', color: '#5A6B7D' }}>
                  {s.jour} {s.date} Jan
                </span>
                <span className={`badge ${s.done ? 'badge-green' : 'badge-gray'}`}>
                  {s.done ? 'Présent' : 'À venir'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progression */}
        <div className="card card-p">
          <div className="card-header">
            <h2 className="card-title">Progression</h2>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.9rem', color: '#C9922A' }}>{progress}%</span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '.78rem', color: '#7A8CA0' }}>Programme général</span>
            </div>
            <div className="progress-bar" style={{ height: 10, marginBottom: 16 }}>
              <div className="progress-fill progress-fill-gold" style={{ width: `${progress}%` }} />
            </div>

            {[
              { label: 'Grammaire', pct: 78 },
              { label: 'Vocabulaire', pct: 65 },
              { label: 'Expression écrite', pct: 72 },
              { label: 'Compréhension orale', pct: 55 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div className="row-between" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: '.78rem', color: '#374151', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: '.72rem', color: '#9AABBC' }}>{item.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card card-p">
          <div className="card-header">
            <h2 className="card-title">Notifications</h2>
            <span className="badge badge-navy">3</span>
          </div>
          <div>
            {NOTIFS.map((n, i) => (
              <div key={i} className="list-item">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: n.bg, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="list-item-title" style={{ fontSize: '.78rem' }}>{n.text}</div>
                  <div className="list-item-sub">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Documents ── */}
      <div className="card card-p">
        <div className="card-header">
          <h2 className="card-title">Mes documents</h2>
          <button className="btn btn-ghost btn-sm">Voir tous</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {DOCS.map(d => (
              <tr key={d.name}>
                <td>
                  <div className="row">
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: `${d.iconColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={d.iconColor} strokeWidth="1.8" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
                      </svg>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1a2535' }}>{d.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-gray">{d.type}</span></td>
                <td style={{ color: '#9AABBC' }}>{d.date}</td>
                <td>
                  <button className="btn btn-outline btn-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Télécharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
