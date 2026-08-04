'use client'

import { useState } from 'react'

type Status = 'present' | 'absent' | 'retard' | null

const INITIAL_STUDENTS: { id: number; nom: string; initials: string; status: Status }[] = [
  { id: 1, nom: 'Ahmed Cherkaoui', initials: 'AC', status: 'present' },
  { id: 2, nom: 'Fatima Zahra El Idrissi', initials: 'FZ', status: 'present' },
  { id: 3, nom: 'Karim Ouali', initials: 'KO', status: null },
  { id: 4, nom: 'Sara Benali', initials: 'SB', status: 'present' },
  { id: 5, nom: 'Omar Tahiri', initials: 'OT', status: 'absent' },
  { id: 6, nom: 'Nour El Houda Fassi', initials: 'NF', status: null },
  { id: 7, nom: 'Yasmine Ait Ouali', initials: 'YA', status: 'retard' },
  { id: 8, nom: 'Mehdi Bensouda', initials: 'MB', status: null },
  { id: 9, nom: 'Amine Rachidi', initials: 'AR', status: 'present' },
  { id: 10, nom: 'Halima El Ouafi', initials: 'HO', status: 'absent' },
  { id: 11, nom: 'Rachid Berrada', initials: 'RB', status: null },
  { id: 12, nom: 'Khadija Mansouri', initials: 'KM', status: 'present' },
]

const GROUPS = ['Anglais B2', 'Maths Avancés', 'Français A2 Soir', 'Espagnol Débutant']

export default function PresencePage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS.map(s => ({ ...s })))
  const [selectedGroup, setSelectedGroup] = useState(0)
  const [showQr, setShowQr] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [showValidationModal, setShowValidationModal] = useState(false)

  const setStatus = (id: number, status: Status) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const counts = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    retard: students.filter(s => s.status === 'retard').length,
    pending: students.filter(s => s.status === null).length,
  }

  const handleValidateAttendance = () => {
    setShowValidationModal(true)
  }

  const confirmValidation = () => {
    setShowValidationModal(false)
    triggerToast(`Feuille de présence pour "${GROUPS[selectedGroup]}" validée et enregistrée !`)
  }

  return (
    <div>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#15803D', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(21,128,61,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="op-page-header">
        <div>
          <div className="op-breadcrumb">
            <span>Personnel</span>
            <span className="op-breadcrumb-sep">›</span>
            <span className="op-breadcrumb-active">Présence</span>
          </div>
          <h1 className="op-page-title">Feuille de présence</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowQr(!showQr)} className="btn btn-ghost" style={{ border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, fontSize: '.84rem', fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            {showQr ? 'Masquer QR Code' : 'Afficher QR Code'}
          </button>
          <button className="btn-navy" onClick={handleValidateAttendance}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Valider les présences
          </button>
        </div>
      </div>

      {/* Group & Session Bar */}
      <div className="op-card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <select value={selectedGroup} onChange={e => setSelectedGroup(Number(e.target.value))} className="search-input" style={{ width: 180, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFF', fontWeight: 700, color: '#0F2347' }}>
          {GROUPS.map((g, i) => <option key={g} value={i}>{g}</option>)}
        </select>
        <span style={{ fontSize: '.84rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Session du jour : 10h00 – 12h00
        </span>
        <span style={{ fontSize: '.84rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Mercredi 14 mai 2025
        </span>
      </div>

      {/* 4 Stat KPI Cards Row */}
      <div className="op-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="op-stat-card">
          <div className="op-stat-icon" style={{ background: '#EBF5FF', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Présents</span>
            <span className="op-stat-val" style={{ fontSize: '1.4rem' }}>{counts.present}</span>
          </div>
        </div>

        <div className="op-stat-card">
          <div className="op-stat-icon" style={{ background: '#FEE2E2', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Absents</span>
            <span className="op-stat-val" style={{ fontSize: '1.4rem' }}>{counts.absent}</span>
          </div>
        </div>

        <div className="op-stat-card">
          <div className="op-stat-icon" style={{ background: '#FEF3C7', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">En retard</span>
            <span className="op-stat-val" style={{ fontSize: '1.4rem' }}>{counts.retard}</span>
          </div>
        </div>

        <div className="op-stat-card">
          <div className="op-stat-icon" style={{ background: '#EBF5FF', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Non saisis</span>
            <span className="op-stat-val" style={{ fontSize: '1.4rem' }}>{counts.pending}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showQr ? '1fr 300px' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Student Checklist Table */}
        <div className="op-card" style={{ overflow: 'hidden' }}>
          <div className="row-between" style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#0F2347' }}>
              Liste des élèves — {GROUPS[selectedGroup]}
            </h2>
            <span style={{ fontSize: '.8rem', color: '#64748B' }}>{students.length} élèves inscrits</span>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Élève</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ color: '#94A3B8', fontSize: '.8rem' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0F2347', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800 }}>
                          {s.initials}
                        </div>
                        <span style={{ fontWeight: 700, color: '#0F2347' }}>{s.nom}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '.8rem', color: '#64748B' }}>
                      Apprenant · <strong style={{ color: s.status === 'present' ? '#0F2347' : s.status === 'absent' ? '#B91C1C' : s.status === 'retard' ? '#D97706' : '#64748B' }}>
                        {s.status ? s.status.toUpperCase() : 'Statut non saisi'}
                      </strong>
                    </td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => setStatus(s.id, 'present')}
                          style={{
                            padding: '6px 14px', borderRadius: 6, fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
                            background: s.status === 'present' ? '#0F2347' : '#FFFFFF',
                            color: s.status === 'present' ? '#FFFFFF' : '#475569',
                            border: `1px solid ${s.status === 'present' ? '#0F2347' : '#E2E8F0'}`,
                          }}
                        >
                          Présent
                        </button>
                        <button
                          onClick={() => setStatus(s.id, 'retard')}
                          style={{
                            padding: '6px 14px', borderRadius: 6, fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
                            background: s.status === 'retard' ? '#D97706' : '#FFFFFF',
                            color: s.status === 'retard' ? '#FFFFFF' : '#475569',
                            border: `1px solid ${s.status === 'retard' ? '#D97706' : '#E2E8F0'}`,
                          }}
                        >
                          Retard
                        </button>
                        <button
                          onClick={() => setStatus(s.id, 'absent')}
                          style={{
                            padding: '6px 14px', borderRadius: 6, fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
                            background: s.status === 'absent' ? '#0F2347' : '#FFFFFF',
                            color: s.status === 'absent' ? '#FFFFFF' : '#475569',
                            border: `1px solid ${s.status === 'absent' ? '#0F2347' : '#E2E8F0'}`,
                          }}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '16px 24px', background: '#FAFAFA', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Les changements sont enregistrés automatiquement.
            </span>
            <button className="btn-navy" onClick={handleValidateAttendance}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Valider et enregistrer la séance
            </button>
          </div>
        </div>

        {/* QR Code panel */}
        {showQr && (
          <div className="op-card" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#0F2347', marginBottom: 4 }}>QR Code du jour</h3>
            <p style={{ fontSize: '.78rem', color: '#64748B', marginBottom: 20 }}>Les élèves scannent ce code pour valider leur présence.</p>

            <div style={{ width: 180, height: 180, margin: '0 auto 20px', background: '#0F2347', borderRadius: 16, padding: 16, boxShadow: '0 8px 24px rgba(15,35,71,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 60 60" fill="none" style={{ width: '100%', height: '100%' }}>
                <rect x="2" y="2" width="16" height="16" rx="2" fill="white" /><rect x="5" y="5" width="10" height="10" rx="1" fill="#0F2347" /><rect x="7" y="7" width="6" height="6" fill="white" />
                <rect x="42" y="2" width="16" height="16" rx="2" fill="white" /><rect x="45" y="5" width="10" height="10" rx="1" fill="#0F2347" /><rect x="47" y="7" width="6" height="6" fill="white" />
                <rect x="2" y="42" width="16" height="16" rx="2" fill="white" /><rect x="5" y="45" width="10" height="10" rx="1" fill="#0F2347" /><rect x="7" y="47" width="6" height="6" fill="white" />
                {[22,25,28,31,34,37].map((x, i) => [22,25,28,31,34,37].map((y, j) => (i + j) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="2.5" height="2.5" fill="white" opacity={0.9} /> : null))}
              </svg>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px', marginBottom: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '.75rem', color: '#64748B' }}>Code PIN de secours</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: '1.5rem', color: '#0F2347', letterSpacing: '4px', marginTop: 2 }}>4829</div>
            </div>

            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', border: '1px solid #D97706', color: '#B45309', background: '#FEFCE8', fontWeight: 700 }} onClick={() => window.print()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Imprimer QR Code
            </button>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showValidationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="op-card" style={{ width: '100%', maxWidth: 440, padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#0F2347', marginBottom: 8 }}>Confirmer la validation</h2>
            <p style={{ fontSize: '.84rem', color: '#64748B', marginBottom: 16 }}>Vous allez enregistrer la feuille de présence pour <strong>{GROUPS[selectedGroup]}</strong> :</p>

            <div style={{ background: '#F8FAFC', borderRadius: 9, padding: '14px 18px', marginBottom: 20, border: '1px solid #E2E8F0' }}>
              <div className="row-between" style={{ padding: '6px 0' }}>
                <span style={{ fontSize: '.84rem', color: '#64748B' }}>Présents</span>
                <span className="badge badge-green">{counts.present}</span>
              </div>
              <div className="row-between" style={{ padding: '6px 0' }}>
                <span style={{ fontSize: '.84rem', color: '#64748B' }}>Retards</span>
                <span className="badge badge-gold">{counts.retard}</span>
              </div>
              <div className="row-between" style={{ padding: '6px 0' }}>
                <span style={{ fontSize: '.84rem', color: '#64748B' }}>Absents</span>
                <span className="badge badge-red">{counts.absent}</span>
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowValidationModal(false)}>Annuler</button>
              <button className="btn-navy btn-sm" style={{ padding: '8px 16px' }} onClick={confirmValidation}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
