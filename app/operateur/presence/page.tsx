'use client'
import { useState } from 'react'

const NAVY = '#1B3A6B'
const NAVY_DARK = '#0F2347'
const GOLD = '#C9922A'

type Status = 'present' | 'absent' | 'retard' | null

const INITIAL_STUDENTS: { nom: string; initials: string; status: Status }[] = [
  { nom: 'Ahmed Cherkaoui', initials: 'AC', status: 'present' },
  { nom: 'Fatima Zahra El Idrissi', initials: 'FZ', status: 'present' },
  { nom: 'Karim Ouali', initials: 'KO', status: null },
  { nom: 'Sara Benali', initials: 'SB', status: 'present' },
  { nom: 'Omar Tahiri', initials: 'OT', status: 'absent' },
  { nom: 'Nour El Houda Fassi', initials: 'NF', status: null },
  { nom: 'Yasmine Ait Ouali', initials: 'YA', status: 'retard' },
  { nom: 'Mehdi Bensouda', initials: 'MB', status: null },
  { nom: 'Amine Rachidi', initials: 'AR', status: 'present' },
  { nom: 'Halima El Ouafi', initials: 'HO', status: 'absent' },
  { nom: 'Rachid Berrada', initials: 'RB', status: null },
  { nom: 'Khadija Mansouri', initials: 'KM', status: 'present' },
]

const GROUPS = ['Anglais B2', 'Maths Avancés', 'Français A2 Soir', 'Espagnol Débutant']

function StatusBtn({ label, active, color, bg, onClick }: { label: string; active: boolean; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 7, border: `1.5px solid ${active ? color : 'rgba(27,58,107,.12)'}`, background: active ? bg : '#fff', color: active ? color : '#94a3b8', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>
      {label}
    </button>
  )
}

export default function PresencePage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS.map(s => ({ ...s })))
  const [selectedGroup, setSelectedGroup] = useState(0)
  const [showQr, setShowQr] = useState(true)

  function setStatus(i: number, status: Status) {
    setStudents(prev => prev.map((s, idx) => idx === i ? { ...s, status } : s))
  }

  const counts = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    retard: students.filter(s => s.status === 'retard').length,
    pending: students.filter(s => s.status === null).length,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 26, color: NAVY_DARK, marginBottom: 8 }}>Feuille de présence</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select value={selectedGroup} onChange={e => setSelectedGroup(Number(e.target.value))} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid rgba(27,58,107,.15)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13.5, color: NAVY, background: '#fff', outline: 'none', cursor: 'pointer' }}>
              {GROUPS.map((g, i) => <option key={g} value={i}>{g}</option>)}
            </select>
            <span style={{ fontSize: 13, color: '#64748b' }}>·</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>Lundi 20 Janvier 2025</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>·</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>10h – 12h</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowQr(!showQr)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: `1.5px solid ${showQr ? NAVY : 'rgba(27,58,107,.15)'}`, borderRadius: 9, background: showQr ? 'rgba(27,58,107,.06)' : '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: NAVY, cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            QR Code
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: 'none', borderRadius: 9, background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,58,107,.25)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Valider les présences
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Présents', val: counts.present, color: '#059669', bg: 'rgba(5,150,105,.1)' },
          { label: 'Absents', val: counts.absent, color: '#DC2626', bg: 'rgba(220,38,38,.09)' },
          { label: 'En retard', val: counts.retard, color: GOLD, bg: 'rgba(201,146,42,.1)' },
          { label: 'Non saisis', val: counts.pending, color: '#64748b', bg: 'rgba(100,116,139,.09)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 11, padding: '16px 18px', border: '1px solid rgba(27,58,107,.07)', boxShadow: '0 1px 3px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 18, color: s.color }}>
              {s.val}
            </div>
            <span style={{ fontSize: 13, color: '#64748b' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showQr ? '1fr 300px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Checklist */}
        <div style={{ background: '#fff', borderRadius: 13, border: '1px solid rgba(27,58,107,.07)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(27,58,107,.06)' }}>
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(27,58,107,.07)', background: '#F5F6F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#374151' }}>Liste des élèves — {GROUPS[selectedGroup]}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{students.length} élèves</span>
          </div>
          {students.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < students.length - 1 ? '1px solid rgba(27,58,107,.05)' : 'none', background: s.status === null ? '#fffdf8' : '#fff', transition: 'background .12s' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 12,
                background: s.status === 'present' ? 'rgba(5,150,105,.12)' : s.status === 'absent' ? 'rgba(220,38,38,.1)' : s.status === 'retard' ? 'rgba(201,146,42,.12)' : 'rgba(27,58,107,.08)',
                color: s.status === 'present' ? '#059669' : s.status === 'absent' ? '#DC2626' : s.status === 'retard' ? GOLD : NAVY,
              }}>{s.initials}</div>
              <span style={{ flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13.5, color: '#1a1823' }}>{s.nom}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusBtn label="Présent" active={s.status === 'present'} color="#059669" bg="rgba(5,150,105,.12)" onClick={() => setStatus(i, 'present')} />
                <StatusBtn label="Retard" active={s.status === 'retard'} color={GOLD} bg="rgba(201,146,42,.12)" onClick={() => setStatus(i, 'retard')} />
                <StatusBtn label="Absent" active={s.status === 'absent'} color="#DC2626" bg="rgba(220,38,38,.1)" onClick={() => setStatus(i, 'absent')} />
              </div>
            </div>
          ))}
          <div style={{ padding: '16px 22px', background: '#F5F6F8', borderTop: '1px solid rgba(27,58,107,.07)', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', border: 'none', borderRadius: 9, background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,58,107,.28)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Valider et enregistrer
            </button>
          </div>
        </div>

        {/* QR Code panel */}
        {showQr && (
          <div style={{ background: '#fff', borderRadius: 13, padding: '28px 24px', border: '1px solid rgba(27,58,107,.07)', boxShadow: '0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(27,58,107,.06)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY_DARK, marginBottom: 6 }}>QR Code du jour</div>
            <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 22, lineHeight: 1.5 }}>Les élèves scannent ce code pour s'enregistrer automatiquement</p>

            {/* QR visual */}
            <div style={{ width: 180, height: 180, margin: '0 auto 18px', background: NAVY, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxShadow: `0 8px 28px rgba(27,58,107,.3)` }}>
              <svg viewBox="0 0 60 60" fill="none" style={{ width: '100%', height: '100%' }}>
                {/* Top-left finder */}
                <rect x="2" y="2" width="16" height="16" rx="2" fill="white" /><rect x="5" y="5" width="10" height="10" rx="1" fill={NAVY} /><rect x="7" y="7" width="6" height="6" fill="white" />
                {/* Top-right finder */}
                <rect x="42" y="2" width="16" height="16" rx="2" fill="white" /><rect x="45" y="5" width="10" height="10" rx="1" fill={NAVY} /><rect x="47" y="7" width="6" height="6" fill="white" />
                {/* Bottom-left finder */}
                <rect x="2" y="42" width="16" height="16" rx="2" fill="white" /><rect x="5" y="45" width="10" height="10" rx="1" fill={NAVY} /><rect x="7" y="47" width="6" height="6" fill="white" />
                {/* Data modules */}
                {[22,25,28,31,34,37].map((x, i) => [22,25,28,31,34,37].map((y, j) => (i + j) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="2.5" height="2.5" fill="white" opacity={0.85} /> : null))}
                {/* Timing */}
                {[22,26,30,34,38].map(x => <rect key={`t${x}`} x={x} y="19" width="2.5" height="2.5" fill="white" opacity={0.5} />)}
                {[22,26,30,34,38].map(y => <rect key={`tv${y}`} x="19" y={y} width="2.5" height="2.5" fill="white" opacity={0.5} />)}
              </svg>
            </div>

            {/* Code display */}
            <div style={{ background: '#F5F6F8', borderRadius: 10, padding: '12px 16px', marginBottom: 18, border: '1px solid rgba(27,58,107,.1)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Code de session</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, letterSpacing: '6px' }}>4829</div>
            </div>

            <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 18, lineHeight: 1.5 }}>
              Expire dans <strong style={{ color: '#DC2626' }}>45 min</strong> · Valide pour {GROUPS[selectedGroup]}
            </div>

            <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid rgba(27,58,107,.15)', background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12.5, color: NAVY, cursor: 'pointer' }}>
              Afficher en plein écran
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
