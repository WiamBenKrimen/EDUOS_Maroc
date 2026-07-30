'use client'

import { useState } from 'react'

const STUDENTS_FOR_CERT = [
  { id: 1, nom: 'Ahmed Cherkaoui', groupe: 'Anglais B1', niveau: 'B1 Cambridge', note: 78, eligible: true },
  { id: 2, nom: 'Fatima Zahra El Idrissi', groupe: 'Français B2', niveau: 'B2 DELF', note: 85, eligible: true },
  { id: 3, nom: 'Karim Ouali', groupe: 'Anglais B2', niveau: 'B2 Cambridge', note: 62, eligible: true },
  { id: 4, nom: 'Sara Benali', groupe: 'Gestion de projet', niveau: 'Attestation de formation', note: 91, eligible: true },
  { id: 5, nom: 'Omar Tahiri', groupe: 'Marketing digital', niveau: 'Attestation de formation', note: 44, eligible: false },
  { id: 6, nom: 'Nour El Houda Fassi', groupe: 'Français A2', niveau: 'A2 DELF', note: 73, eligible: true },
]

export default function AttestationsPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [previewStudent, setPreviewStudent] = useState<typeof STUDENTS_FOR_CERT[0] | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showBatchModal, setShowBatchModal] = useState(false)

  const toggleAll = () => {
    if (selected.size === STUDENTS_FOR_CERT.filter(s => s.eligible).length) setSelected(new Set())
    else setSelected(new Set(STUDENTS_FOR_CERT.map((_, i) => i).filter(i => STUDENTS_FOR_CERT[i].eligible)))
  }

  const toggle = (i: number) => {
    const n = new Set(selected)
    n.has(i) ? n.delete(i) : n.add(i)
    setSelected(n)
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleGenerateBatch = () => {
    setShowBatchModal(true)
  }

  const confirmBatchGeneration = () => {
    setShowBatchModal(false)
    triggerToast(`${selected.size} attestation(s) générée(s) et disponible(s) en PDF !`)
    setSelected(new Set())
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
            <span>Personnel</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Attestations</span>
          </div>
          <h1 className="page-title">Attestations & Certifications</h1>
          <p className="page-subtitle">Délivrez les attestations de fin de formation certifiées</p>
        </div>
        <div className="page-header-actions">
          <button
            disabled={selected.size === 0}
            className="btn btn-primary btn-sm"
            onClick={handleGenerateBatch}
            style={{ opacity: selected.size > 0 ? 1 : 0.5, cursor: selected.size > 0 ? 'pointer' : 'not-allowed' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Générer {selected.size > 0 ? `(${selected.size})` : ''} attestation{selected.size > 1 ? 's' : ''}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card" style={{ padding: '16px 20px' }}>
          <div className="row-between">
            <span className="card-meta">Apprenants éligibles</span>
            <span className="badge badge-green">Note &gt;= 60</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8, color: '#059669' }}>
            {STUDENTS_FOR_CERT.filter(s => s.eligible).length}
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '16px 20px' }}>
          <div className="row-between">
            <span className="card-meta">Non éligibles</span>
            <span className="badge badge-red">Insuffisant</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8, color: '#DC2626' }}>
            {STUDENTS_FOR_CERT.filter(s => !s.eligible).length}
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '16px 20px' }}>
          <div className="row-between">
            <span className="card-meta">Sélectionnés</span>
            <span className="badge badge-navy">Prêts</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8 }}>
            {selected.size}
          </div>
        </div>
      </div>

      {/* Selection Card List */}
      <div className="card">
        <div className="row" style={{ padding: '14px 20px', borderBottom: '1px solid #EEF0F4', background: '#F8F9FB' }}>
          <input
            type="checkbox"
            checked={selected.size === STUDENTS_FOR_CERT.filter(s => s.eligible).length && selected.size > 0}
            onChange={toggleAll}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.75rem', color: '#7A8CA0', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Sélectionner tous les éligibles
          </span>
        </div>

        <div>
          {STUDENTS_FOR_CERT.map((s, i) => (
            <div key={s.id} className="list-item card-p" style={{ opacity: s.eligible ? 1 : 0.5 }}>
              <input
                type="checkbox"
                disabled={!s.eligible}
                checked={selected.has(i)}
                onChange={() => toggle(i)}
                style={{ width: 16, height: 16, cursor: s.eligible ? 'pointer' : 'not-allowed' }}
              />

              <div className={`avatar avatar-md ${s.eligible ? 'avatar-navy' : 'avatar-red'}`}>
                {s.nom.charAt(0)}
              </div>

              <div style={{ flex: 1 }}>
                <div className="list-item-title">{s.nom}</div>
                <div className="list-item-sub">{s.groupe} · {s.niveau}</div>
              </div>

              <div style={{ textAlign: 'center', width: 90 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: '1rem', color: s.note >= 60 ? '#059669' : '#DC2626' }}>
                  {s.note} / 100
                </div>
                <div style={{ fontSize: '.68rem', color: '#9AABBC' }}>Note finale</div>
              </div>

              <span className={`badge ${s.eligible ? 'badge-green' : 'badge-red'}`}>
                {s.eligible ? 'Éligible' : 'Non éligible'}
              </span>

              {s.eligible && (
                <button className="btn btn-outline btn-sm" onClick={() => setPreviewStudent(s)}>
                  Aperçu PDF
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
            <div style={{ border: '3px double #1B3A6B', padding: '24px 20px', borderRadius: 12, background: '#FFFDF9', marginBottom: 18 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: '1.2rem', color: '#1B3A6B', letterSpacing: '1px', marginBottom: 4 }}>
                ATTESTATION DE FORMATION
              </div>
              <div style={{ fontSize: '.72rem', color: '#C9922A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>
                EDUOS MAROC · Centre Atlas
              </div>

              <p style={{ fontSize: '.84rem', color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>
                Le Centre Atlas certifie que <strong>{previewStudent.nom}</strong> a suivi avec succès le programme <strong>{previewStudent.groupe}</strong> ({previewStudent.niveau}) avec une note finale de <strong>{previewStudent.note}/100</strong>.
              </p>

              <div className="row-between" style={{ borderTop: '1px solid #E8ECF2', paddingTop: 12, fontSize: '.75rem', color: '#7A8CA0' }}>
                <span>Fait à Casablanca, le 26 Juillet 2026</span>
                <span style={{ fontWeight: 700, color: '#1B3A6B' }}>N° CERT-2026-0921</span>
              </div>
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setPreviewStudent(null)}>Fermer</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>Imprimer / Télécharger PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Generation Modal */}
      {showBatchModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
            <h2 className="page-title" style={{ fontSize: '1.15rem', marginBottom: 8 }}>Générer les attestations</h2>
            <p className="card-meta" style={{ marginBottom: 18 }}>Vous allez générer {selected.size} attestation(s) officielles en PDF.</p>

            <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBatchModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={confirmBatchGeneration}>Confirmer la génération</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
