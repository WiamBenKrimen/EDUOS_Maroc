'use client'
import { useState } from 'react'

const STUDENTS_FOR_CERT = [
  { nom: 'Ahmed Cherkaoui', groupe: 'Anglais B1', niveau: 'B1 Cambridge', note: 78, eligible: true },
  { nom: 'Fatima Zahra El Idrissi', groupe: 'Français B2', niveau: 'B2 DELF', note: 85, eligible: true },
  { nom: 'Karim Ouali', groupe: 'Anglais B2', niveau: 'B2 Cambridge', note: 62, eligible: true },
  { nom: 'Sara Benali', groupe: 'Gestion de projet', niveau: 'Attestation de formation', note: 91, eligible: true },
  { nom: 'Omar Tahiri', groupe: 'Marketing digital', niveau: 'Attestation de formation', note: 44, eligible: false },
  { nom: 'Nour El Houda Fassi', groupe: 'Français A2', niveau: 'A2 DELF', note: 73, eligible: true },
]

export default function AttestationsPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  function toggleAll() {
    if (selected.size === STUDENTS_FOR_CERT.filter(s => s.eligible).length) setSelected(new Set())
    else setSelected(new Set(STUDENTS_FOR_CERT.map((_, i) => i).filter(i => STUDENTS_FOR_CERT[i].eligible)))
  }

  function toggle(i: number) {
    const n = new Set(selected)
    n.has(i) ? n.delete(i) : n.add(i)
    setSelected(n)
  }

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Attestations & Certifications</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Générez les attestations de fin de formation pour vos apprenants</p>
        </div>
        <button disabled={selected.size === 0} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: selected.size > 0 ? '#1B3A6B' : '#E2D9CC', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: selected.size > 0 ? 'pointer' : 'not-allowed' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Générer {selected.size > 0 ? `(${selected.size})` : ''} attestation{selected.size > 1 ? 's' : ''}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[{ l: 'Éligibles', v: STUDENTS_FOR_CERT.filter(s => s.eligible).length, c: '#059669' }, { l: 'Non éligibles', v: STUDENTS_FOR_CERT.filter(s => !s.eligible).length, c: '#DC2626' }, { l: 'Sélectionnés', v: selected.size, c: '#1B3A6B' }].map(s => (
          <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', border: '1px solid #E2D9CC', flex: 1 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.5rem', color: s.c, marginBottom: 2 }}>{s.v}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f1ede8', background: '#faf8f5' }}>
          <input type="checkbox" checked={selected.size === STUDENTS_FOR_CERT.filter(s => s.eligible).length && selected.size > 0} onChange={toggleAll} style={{ width: 16, height: 16, cursor: 'pointer' }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Sélectionner tous les éligibles</span>
        </div>
        {STUDENTS_FOR_CERT.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < STUDENTS_FOR_CERT.length - 1 ? '1px solid #f1ede8' : 'none', opacity: s.eligible ? 1 : 0.5, transition: 'background .15s' }}
            onMouseEnter={e => s.eligible && (e.currentTarget.style.background = '#faf8f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <input type="checkbox" disabled={!s.eligible} checked={selected.has(i)} onChange={() => toggle(i)} style={{ width: 16, height: 16, cursor: s.eligible ? 'pointer' : 'not-allowed' }} />
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: s.eligible ? 'linear-gradient(135deg, #1B3A6B, #2a5298)' : '#E2D9CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#fff', flexShrink: 0 }}>{s.nom.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.9rem', color: '#1a1823', marginBottom: 2 }}>{s.nom}</div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{s.groupe} · {s.niveau}</div>
            </div>
            <div style={{ textAlign: 'center', width: 80 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.1rem', color: s.note >= 60 ? '#059669' : '#DC2626' }}>{s.note}/100</div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.68rem', color: '#94a3b8' }}>Note finale</div>
            </div>
            <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 99, background: s.eligible ? 'rgba(5,150,105,.08)' : 'rgba(220,38,38,.07)', color: s.eligible ? '#059669' : '#DC2626', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{s.eligible ? 'Éligible' : 'Non éligible'}</span>
            {s.eligible && (
              <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#1B3A6B', cursor: 'pointer' }}>Aperçu PDF</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
