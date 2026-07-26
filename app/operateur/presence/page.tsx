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
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(5,150,105,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Opérateur</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Présence</span>
          </div>
          <h1 className="page-title">Feuille de présence</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <select value={selectedGroup} onChange={e => setSelectedGroup(Number(e.target.value))} className="search-input" style={{ width: 170, paddingLeft: 10 }}>
              {GROUPS.map((g, i) => <option key={g} value={i}>{g}</option>)}
            </select>
            <span style={{ fontSize: '.8rem', color: '#9AABBC' }}>· Session du jour: 10h00 – 12h00</span>
          </div>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setShowQr(!showQr)} className={`btn ${showQr ? 'btn-outline' : 'btn-ghost'} btn-sm`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            {showQr ? 'Masquer QR Code' : 'Afficher QR Code'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleValidateAttendance}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Valider les présences
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Présents', val: counts.present, cls: 'badge-green', icon: '✓' },
          { label: 'Absents', val: counts.absent, cls: 'badge-red', icon: '✕' },
          { label: 'En retard', val: counts.retard, cls: 'badge-gold', icon: '⏱' },
          { label: 'Non saisis', val: counts.pending, cls: 'badge-gray', icon: '?' },
        ].map(s => (
          <div key={s.label} className="kpi-card" style={{ padding: '16px 20px' }}>
            <div className="row-between">
              <span className="card-meta">{s.label}</span>
              <span className={`badge ${s.cls}`}>{s.icon}</span>
            </div>
            <div className="kpi-value" style={{ marginTop: 8 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showQr ? '1fr 300px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Checklist */}
        <div className="card">
          <div className="card-header card-p" style={{ paddingBottom: 14, borderBottom: '1px solid #EEF0F4' }}>
            <h2 className="card-title">Liste des élèves — {GROUPS[selectedGroup]}</h2>
            <span className="card-meta">{students.length} élèves inscrits</span>
          </div>

          <div>
            {students.map((s) => (
              <div key={s.id} className="list-item card-p" style={{ background: s.status === null ? '#FFFDF7' : '#fff' }}>
                <div className={`avatar avatar-sm ${s.status === 'present' ? 'avatar-green' : s.status === 'absent' ? 'avatar-red' : s.status === 'retard' ? 'avatar-gold' : 'avatar-navy'}`}>
                  {s.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="list-item-title">{s.nom}</div>
                  <div className="list-item-sub">Apprenant {s.status ? `· ${s.status.toUpperCase()}` : '· Statut non saisi'}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button
                    onClick={() => setStatus(s.id, 'present')}
                    className={`btn btn-sm ${s.status === 'present' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ background: s.status === 'present' ? '#059669' : undefined, borderColor: s.status === 'present' ? '#059669' : undefined }}
                  >
                    Présent
                  </button>
                  <button
                    onClick={() => setStatus(s.id, 'retard')}
                    className={`btn btn-sm ${s.status === 'retard' ? 'btn-gold' : 'btn-ghost'}`}
                  >
                    Retard
                  </button>
                  <button
                    onClick={() => setStatus(s.id, 'absent')}
                    className={`btn btn-sm ${s.status === 'absent' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ background: s.status === 'absent' ? '#DC2626' : undefined, borderColor: s.status === 'absent' ? '#DC2626' : undefined }}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 24px', background: '#F8F9FB', borderTop: '1px solid #EEF0F4', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleValidateAttendance}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Valider et enregistrer la séance
            </button>
          </div>
        </div>

        {/* QR Code panel */}
        {showQr && (
          <div className="card card-p" style={{ textAlign: 'center' }}>
            <h3 className="card-title" style={{ marginBottom: 4 }}>QR Code du jour</h3>
            <p className="card-meta" style={{ marginBottom: 18 }}>Les élèves scannent ce code pour valider leur présence</p>

            <div style={{ width: 170, height: 170, margin: '0 auto 16px', background: '#1B3A6B', borderRadius: 14, padding: 14, boxShadow: '0 8px 24px rgba(27,58,107,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 60 60" fill="none" style={{ width: '100%', height: '100%' }}>
                <rect x="2" y="2" width="16" height="16" rx="2" fill="white" /><rect x="5" y="5" width="10" height="10" rx="1" fill="#1B3A6B" /><rect x="7" y="7" width="6" height="6" fill="white" />
                <rect x="42" y="2" width="16" height="16" rx="2" fill="white" /><rect x="45" y="5" width="10" height="10" rx="1" fill="#1B3A6B" /><rect x="47" y="7" width="6" height="6" fill="white" />
                <rect x="2" y="42" width="16" height="16" rx="2" fill="white" /><rect x="5" y="45" width="10" height="10" rx="1" fill="#1B3A6B" /><rect x="7" y="47" width="6" height="6" fill="white" />
                {[22,25,28,31,34,37].map((x, i) => [22,25,28,31,34,37].map((y, j) => (i + j) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="2.5" height="2.5" fill="white" opacity={0.9} /> : null))}
              </svg>
            </div>

            <div style={{ background: '#F8F9FB', borderRadius: 8, padding: '10px 14px', marginBottom: 14, border: '1px solid #E8ECF2' }}>
              <div className="card-meta">Code PIN de secours</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: '1.4rem', color: '#1B3A6B', letterSpacing: '4px' }}>4829</div>
            </div>

            <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.print()}>
              Imprimer QR Code
            </button>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showValidationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 440 }}>
            <h2 className="page-title" style={{ fontSize: '1.15rem', marginBottom: 8 }}>Confirmer la validation</h2>
            <p className="card-meta" style={{ marginBottom: 16 }}>Vous allez enregistrer la feuille de présence pour <strong>{GROUPS[selectedGroup]}</strong> :</p>

            <div style={{ background: '#F8F9FB', borderRadius: 9, padding: '12px 16px', marginBottom: 20, border: '1px solid #E8ECF2' }}>
              <div className="row-between" style={{ padding: '4px 0' }}>
                <span className="card-meta">Présents</span>
                <span className="badge badge-green">{counts.present}</span>
              </div>
              <div className="row-between" style={{ padding: '4px 0' }}>
                <span className="card-meta">Retards</span>
                <span className="badge badge-gold">{counts.retard}</span>
              </div>
              <div className="row-between" style={{ padding: '4px 0' }}>
                <span className="card-meta">Absents</span>
                <span className="badge badge-red">{counts.absent}</span>
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowValidationModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={confirmValidation}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
