'use client'
import { useState } from 'react'
import Link from 'next/link'

const SEANCES = [
  { jour: 'Lun', date: '20', done: true },
  { jour: 'Mer', date: '22', done: true },
  { jour: 'Ven', date: '24', done: true },
  { jour: 'Lun', date: '27', done: false },
  { jour: 'Mer', date: '29', done: false },
]

const NOTIFS = [
  { id: 1, text: 'Rappel : votre cours est demain à 10h — Salle 1', time: 'Il y a 1h', color: '#0F2347', bg: '#F1F5F9', read: false },
  { id: 2, text: 'Prochain paiement : 450 DH le 1er Février 2025', time: 'Il y a 4h', color: '#D97706', bg: '#FEF3C7', read: false },
  { id: 3, text: 'Nouveaux exercices disponibles : Semaine 4 — Présent perfect', time: 'Hier 14h', color: '#059669', bg: '#DCFCE7', read: true },
]

const DOCS = [
  { name: 'Attestation de présence.pdf', type: 'PDF', date: '10 Jan 2025', iconColor: '#7C3AED' },
  { name: 'Programme Anglais B2.pdf', type: 'PDF', date: '2 Jan 2025', iconColor: '#0F2347' },
  { name: 'Règlement intérieur.pdf', type: 'PDF', date: '1 Jan 2025', iconColor: '#D97706' },
]

export default function MonEspacePage() {
  const progress = 68
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [notifList, setNotifList] = useState(NOTIFS)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const markNotifRead = (id: number) => {
    setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    triggerToast('Notification marquée comme lue.')
  }

  const handleDownloadDoc = (docName: string) => {
    triggerToast(`Téléchargement de "${docName}" démarré...`)
  }

  return (
    <div>
      {/* Toast alert */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#0F2347', color: '#FFF', padding: '12px 20px', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontSize: '.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn .2s ease' }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>EDUOS</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#0F2347' }}>Mon espace</span>
          </div>
          <h1 className="page-title">Bonjour, Yasmine</h1>
          <p className="page-subtitle">Anglais B2 · Groupe du matin · Lundi 25 juillet 2025</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="part-user-avatar" style={{ width: 40, height: 40, fontSize: '.9rem' }}>YB</div>
          <span className="badge badge-green" style={{ background: '#DCFCE7', color: '#15803D', border: 'none', padding: '6px 12px', fontWeight: 700 }}>
            Formation en cours
          </span>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="op-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="op-stat-card">
          <div className="op-stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="op-stat-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span className="op-stat-label">Taux de présence</span>
              <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>+5% ce mois</span>
            </div>
            <span className="op-stat-val">87 %</span>
          </div>
        </div>

        <div className="op-stat-card">
          <div className="op-stat-icon gold">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Programme complété</span>
            <span className="op-stat-val">{progress} %</span>
          </div>
        </div>

        <div className="op-stat-card">
          <div className="op-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Prochain paiement</span>
            <span className="op-stat-val">450 DH</span>
          </div>
        </div>

        <div className="op-stat-card">
          <div className="op-stat-icon" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Séances effectuées</span>
            <span className="op-stat-val">24</span>
          </div>
        </div>
      </div>

      {/* ── Middle grid ── */}
      <div className="section-grid-3" style={{ marginBottom: 24 }}>
        {/* Prochain cours */}
        <div className="card card-p" style={{ border: '1px solid #E5E7EB' }}>
          <div className="card-header" style={{ marginBottom: 14 }}>
            <h2 className="card-title" style={{ fontSize: '1rem', color: '#0F2347' }}>Prochain cours</h2>
            <span className="badge badge-navy" style={{ background: '#0F2347', color: '#FFF' }}>Dans 2 jours</span>
          </div>

          <div style={{ textAlign: 'center', padding: '12px 0 20px', background: '#F8FAFC', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
              Lundi 20 Janvier
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: '#0F2347', letterSpacing: '-.04em', lineHeight: 1 }}>
              10h00
            </div>
            <div style={{ fontSize: '.8rem', color: '#64748B', marginTop: 6, fontWeight: 500 }}>Salle 1 · M. Karimi</div>
            
            <button
              onClick={() => triggerToast('Détails du cours consultés.')}
              className="btn btn-navy btn-sm"
              style={{ marginTop: 14, background: '#0F2347', color: '#FFF', width: '85%', justifyContent: 'center' }}
            >
              📖 Voir le programme de la séance
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SEANCES.map((s, i) => (
              <div key={i} className="row-between" style={{ padding: '6px 0', borderBottom: i < SEANCES.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.8rem', color: '#334155' }}>
                  {s.jour} {s.date} Jan
                </span>
                <span className={`badge ${s.done ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '.7rem', fontWeight: 600 }}>
                  {s.done ? '✓ Présent' : 'À venir'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progression */}
        <div className="card card-p" style={{ border: '1px solid #E5E7EB' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2 className="card-title" style={{ fontSize: '1rem', color: '#0F2347' }}>Progression B2</h2>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.95rem', color: '#D97706' }}>{progress}%</span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '.78rem', color: '#64748B', fontWeight: 500 }}>Programme général</span>
            </div>
            <div className="progress-bar" style={{ height: 10, marginBottom: 20, background: '#E2E8F0', borderRadius: 5, overflow: 'hidden' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D97706, #F59E0B)', height: '100%' }} />
            </div>

            {[
              { label: 'Grammaire', pct: 78 },
              { label: 'Vocabulaire', pct: 65 },
              { label: 'Expression écrite', pct: 72 },
              { label: 'Compréhension orale', pct: 55 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div className="row-between" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: '.78rem', color: '#1E293B', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '.75rem', color: '#64748B', fontWeight: 700 }}>{item.pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: '#0F2347', height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card card-p" style={{ border: '1px solid #E5E7EB' }}>
          <div className="card-header" style={{ marginBottom: 14 }}>
            <h2 className="card-title" style={{ fontSize: '1rem', color: '#0F2347' }}>Notifications</h2>
            <span className="badge badge-navy" style={{ background: '#0F2347', color: '#FFF' }}>{notifList.filter(n => !n.read).length}</span>
          </div>
          <div>
            {notifList.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotifRead(n.id)}
                className="list-item"
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 8,
                  background: n.read ? '#FFFFFF' : '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: 'background .15s ease'
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: n.bg, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                  <div className="list-item-title" style={{ fontSize: '.78rem', fontWeight: n.read ? 500 : 700, color: n.read ? '#64748B' : '#0F2347' }}>{n.text}</div>
                  <div className="list-item-sub" style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Documents Section ── */}
      <div className="card card-p" style={{ border: '1px solid #E5E7EB' }}>
        <div className="card-header" style={{ marginBottom: 16 }}>
          <h2 className="card-title" style={{ fontSize: '1.05rem', color: '#0F2347' }}>Mes récents documents</h2>
          <Link href="/participant/documents" className="btn btn-ghost btn-sm" style={{ color: '#0F2347', fontWeight: 700 }}>
            Voir tous →
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {DOCS.map(d => (
              <tr key={d.name}>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${d.iconColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={d.iconColor} strokeWidth="2" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#0F2347', fontSize: '.84rem' }}>{d.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-gray" style={{ fontSize: '.72rem' }}>{d.type}</span></td>
                <td style={{ color: '#64748B', fontSize: '.8rem' }}>{d.date}</td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDownloadDoc(d.name)}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#0F2347', color: '#0F2347', fontWeight: 600 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
