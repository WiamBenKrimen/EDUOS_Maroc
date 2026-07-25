'use client'

const STAT_CARDS = [
  {
    label: 'Élèves inscrits', value: '347', trend: '+12 ce mois',
    trendClass: 'badge-green',
    iconBg: 'rgba(27,58,107,.1)', iconColor: '#1B3A6B',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: 'CA encaissé (mois)', value: '84 200 DH', trend: '+8.4 %',
    trendClass: 'badge-green',
    iconBg: 'rgba(5,150,105,.1)', iconColor: '#059669',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    label: 'Mensualités en retard', value: '23', trend: '-3 cette semaine',
    trendClass: 'badge-red',
    iconBg: 'rgba(220,38,38,.08)', iconColor: '#DC2626',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  {
    label: 'Présence globale', value: '87 %', trend: 'Stable',
    trendClass: 'badge-gray',
    iconBg: 'rgba(201,146,42,.1)', iconColor: '#C9922A',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
]

const GROUPS = [
  { name: 'Anglais B2', detail: '18 / 20 élèves', pct: 90, fill: 'progress-fill-gold' },
  { name: 'Français A2 Soir', detail: '14 / 18 élèves', pct: 78, fill: '' },
  { name: 'Espagnol Débutant', detail: '11 / 15 élèves', pct: 73, fill: '' },
  { name: 'Maths Avancés', detail: '19 / 20 élèves', pct: 95, fill: 'progress-fill-gold' },
]

const RENEWALS = [
  { name: 'Karim Ouali', date: '28 Jan', days: 3 },
  { name: 'Sara El Mansouri', date: '31 Jan', days: 6 },
  { name: 'Nour Chraibi', date: '5 Fév', days: 11 },
  { name: 'Ahmed Tahiri', date: '10 Fév', days: 16 },
  { name: 'Hind Berrada', date: '18 Fév', days: 24 },
]

const ABSENCES = [
  { name: 'Omar Belhaj', group: 'Anglais B2', time: '10h00', initials: 'OB' },
  { name: 'Yasmine Alami', group: 'Anglais B2', time: '10h00', initials: 'YA' },
  { name: 'Rachid El Fassi', group: 'Français A2', time: '17h00', initials: 'RE' },
  { name: 'Fatima Zahra', group: 'Espagnol Déb.', time: '14h00', initials: 'FZ' },
]

const FORMATEURS = [
  { name: 'Karim Alaoui', initials: 'KA', spec: 'Anglais', heures: 32, taux: 120, paid: true },
  { name: 'Leila Bennouna', initials: 'LB', spec: 'Français', heures: 24, taux: 110, paid: false },
  { name: 'Omar El Fassi', initials: 'OE', spec: 'Espagnol', heures: 20, taux: 100, paid: true },
  { name: 'Sanaa Tahiri', initials: 'ST', spec: 'Management', heures: 28, taux: 130, paid: false },
]

function DaysBadge({ days }: { days: number }) {
  const cls = days < 7 ? 'badge-red' : days < 14 ? 'badge-gold' : 'badge-green'
  return <span className={`badge ${cls}`}>{days}j</span>
}

export default function DirecteurDashboard() {
  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>EDUOS</span>
            <span className="page-breadcrumb-sep">›</span>
            <span>Direction</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Dashboard</span>
          </div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vendredi 25 juillet 2025 · Vue d'ensemble de votre centre</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
          <button className="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle action
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="kpi-grid">
        {STAT_CARDS.map(c => (
          <div key={c.label} className="kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background: c.iconBg, color: c.iconColor }}>
                {c.icon}
              </div>
              <span className={`badge ${c.trendClass}`}>{c.trend}</span>
            </div>
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Section grid ── */}
      <div className="section-grid-3">
        {/* Groupes actifs */}
        <div className="card card-p">
          <div className="card-header">
            <h2 className="card-title">Groupes actifs</h2>
            <span className="card-meta">4 groupes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {GROUPS.map(g => (
              <div key={g.name}>
                <div className="row-between" style={{ marginBottom: 6 }}>
                  <span className="list-item-title">{g.name}</span>
                  <span className="card-meta">{g.detail}</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${g.fill}`} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Renouvellements */}
        <div className="card card-p">
          <div className="card-header">
            <h2 className="card-title">Renouvellements</h2>
            <span className="badge badge-gold">5 à venir</span>
          </div>
          <div>
            {RENEWALS.map(r => (
              <div key={r.name} className="list-item">
                <div style={{ flex: 1 }}>
                  <div className="list-item-title">{r.name}</div>
                  <div className="list-item-sub">Expire le {r.date}</div>
                </div>
                <DaysBadge days={r.days} />
              </div>
            ))}
          </div>
        </div>

        {/* Absences */}
        <div className="card card-p">
          <div className="card-header">
            <h2 className="card-title">Absences du jour</h2>
            <span className="badge badge-red">4</span>
          </div>
          <div>
            {ABSENCES.map(a => (
              <div key={a.name} className="list-item">
                <div className="avatar avatar-sm" style={{ background: 'rgba(220,38,38,.12)', color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {a.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="list-item-title">{a.name}</div>
                  <div className="list-item-sub">{a.group} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formateurs table ── */}
      <div className="card card-p">
        <div className="card-header">
          <div>
            <h2 className="card-title">Rémunération formateurs</h2>
            <p className="card-meta" style={{ marginTop: 2 }}>Juillet 2025 — récapitulatif heures et montants</p>
          </div>
          <button className="btn btn-outline btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter PDF
          </button>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {['Formateur', 'Spécialité', 'Heures', 'Taux / h', 'Montant dû', 'Statut'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATEURS.map(f => {
                const montant = f.heures * f.taux
                return (
                  <tr key={f.name}>
                    <td>
                      <div className="row">
                        <div className="avatar avatar-sm avatar-navy">{f.initials}</div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1a2535' }}>{f.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#7A8CA0' }}>{f.spec}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{f.heures}h</td>
                    <td style={{ color: '#7A8CA0' }}>{f.taux} DH/h</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1B3A6B' }}>{montant.toLocaleString('fr-FR')} DH</td>
                    <td>
                      <span className={`badge ${f.paid ? 'badge-green' : 'badge-gold'}`}>
                        {f.paid ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="table-footer-item">
            <div className="table-footer-label">Total heures</div>
            <div className="table-footer-value">104h</div>
          </div>
          <div className="table-footer-item">
            <div className="table-footer-label">Montant total dû</div>
            <div className="table-footer-value" style={{ color: '#1B3A6B', fontSize: '1.1rem' }}>12 440 DH</div>
          </div>
        </div>
      </div>
    </div>
  )
}
