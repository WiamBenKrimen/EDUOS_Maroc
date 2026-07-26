'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const RAPPORTS = [
  {
    id: 1,
    mois: 'Juin 2025',
    formateur: 'K. Alaoui',
    date: '01 juil. 2025',
    presences: 10,
    total: 12,
    note: 78,
    trendLabel: '+4 pts vs mai',
    trendUp: true,
    commentaire: 'Yasmine progresse très bien. Sa compréhension orale s\'améliore sensiblement. Il est conseillé de travailler davantage l\'expression écrite pour atteindre le niveau B2 cible.',
    competences: [
      { label: 'Compréhension orale', val: 82 },
      { label: 'Expression écrite', val: 65 },
      { label: 'Vocabulaire', val: 79 },
      { label: 'Grammaire', val: 74 },
    ],
  },
  {
    id: 2,
    mois: 'Mai 2025',
    formateur: 'K. Alaoui',
    date: '01 juin 2025',
    presences: 11,
    total: 12,
    note: 74,
    trendLabel: '+2 pts vs avr.',
    trendUp: true,
    commentaire: 'Bonne participation en classe. Quelques difficultés avec les temps du passé mais des progrès notables depuis le début de la formation.',
    competences: [
      { label: 'Compréhension orale', val: 76 },
      { label: 'Expression écrite', val: 60 },
      { label: 'Vocabulaire', val: 75 },
      { label: 'Grammaire', val: 68 },
    ],
  },
]

function noteColor(n: number) {
  if (n >= 80) return '#10B981'
  if (n >= 65) return BLUE
  return GOLD
}

function ScoreRing({ note }: { note: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (note / 100) * circ
  const color = noteColor(note)
  return (
    <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .8s ease' }}
      />
      <text
        x="50" y="54"
        textAnchor="middle"
        fill={color}
        fontSize="20"
        fontWeight="800"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}
      >
        {note}
      </text>
      <text
        x="50" y="68"
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="9"
        fontWeight="600"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}
      >
        /100
      </text>
    </svg>
  )
}

function SkillBar({ label, val }: { label: string; val: number }) {
  const color = val >= 75 ? '#10B981' : val >= 60 ? BLUE : GOLD
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '.78rem', fontWeight: 600, color: '#334155' }}>{label}</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '.78rem', fontWeight: 800, color }}>
          {val}%
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 99, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  )
}

export default function RapportsParticipantPage() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const downloadSingleReport = (r: typeof RAPPORTS[0]) => {
    const textContent = `EDUOS MAROC - RAPPORT D'ÉVALUATION PÉDAGOGIQUE\n` +
      `======================================================\n` +
      `Apprenant: Yasmine Benali\n` +
      `Période: ${r.mois}\n` +
      `Formateur: ${r.formateur}\n` +
      `Date du rapport: ${r.date}\n` +
      `Score Global: ${r.note}/100\n` +
      `Présences: ${r.presences}/${r.total} séances (${Math.round((r.presences/r.total)*100)}%)\n\n` +
      `DÉTAIL DES COMPÉTENCES:\n` +
      r.competences.map(c => `- ${c.label}: ${c.val}%`).join('\n') + `\n\n` +
      `REMARQUE DU FORMATEUR:\n` +
      `"${r.commentaire}"\n` +
      `======================================================`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rapport_Evaluation_${r.mois.replace(' ', '_')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Rapport de ${r.mois} téléchargé avec succès !`)
  }

  const exportAll = () => {
    const textContent = `EDUOS MAROC - DOSSIER COMPLET DES ÉVALUATIONS\n` +
      `Apprenant: Yasmine Benali (Anglais B2)\n` +
      `======================================================\n\n` +
      RAPPORTS.map(r => `--- RAPPORT ${r.mois} ---\nScore: ${r.note}/100 | Présence: ${r.presences}/${r.total}\nFormateur: ${r.formateur}\nCommentaire: ${r.commentaire}\n`).join('\n')

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Dossier_Complet_Rapports_Yasmine_Benali.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Exportation globale des rapports effectuée !`)
  }

  const avgNote = Math.round(RAPPORTS.reduce((s, r) => s + r.note, 0) / RAPPORTS.length)
  const totalPresences = RAPPORTS.reduce((s, r) => s + r.presences, 0)
  const totalSeances = RAPPORTS.reduce((s, r) => s + r.total, 0)
  const presencePct = Math.round((totalPresences / totalSeances) * 100)

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: NAVY,
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.85rem',
          fontWeight: 600,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ color: '#10B981' }}>✓</span>
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Rapports de suivi</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Évaluations pédagogiques mensuelles · Anglais B2 · Formateur K. Alaoui</p>
        </div>
        <button
          onClick={exportAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 16px',
            borderRadius: 9,
            border: '1px solid #E2E8F0',
            background: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '.8rem',
            color: NAVY,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Tout exporter (PDF)
        </button>
      </div>

      {/* KPI summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: NAVY, letterSpacing: '-.04em', lineHeight: 1 }}>{avgNote}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#94A3B8' }}>/100</span></div>
            <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>Moyenne générale</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#065F46', letterSpacing: '-.04em', lineHeight: 1 }}>{presencePct}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#94A3B8' }}>%</span></div>
            <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>Assiduité ({totalPresences}/{totalSeances} séances)</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: GOLD, letterSpacing: '-.04em', lineHeight: 1 }}>{RAPPORTS.length}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#94A3B8' }}> reçus</span></div>
            <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>Bilans mensuels disponibles</div>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {RAPPORTS.map((r, i) => {
          const open = expanded === i
          const attendancePct = Math.round((r.presences / r.total) * 100)
          const nc = noteColor(r.note)
          return (
            <div key={r.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)', overflow: 'hidden' }}>
              {/* Card Header */}
              <button
                onClick={() => setExpanded(open ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 12, background: `${nc}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${nc}25` }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.05rem', color: nc, lineHeight: 1 }}>{r.note}</span>
                  <span style={{ fontSize: '.55rem', fontWeight: 700, color: '#94A3B8' }}>/100</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1rem', color: NAVY }}>Rapport d'évaluation — {r.mois}</span>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: r.trendUp ? '#065F46' : GOLD, background: r.trendUp ? '#ECFDF5' : '#FEF3C7', borderRadius: 99, padding: '2px 9px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {r.trendLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.75rem', color: '#64748b' }}>Formateur : <strong style={{ color: NAVY }}>{r.formateur}</strong></span>
                    <span style={{ fontSize: '.75rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '.75rem', color: '#64748b' }}>Délivré le {r.date}</span>
                    <span style={{ fontSize: '.75rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '.75rem', color: '#64748b' }}>{r.presences}/{r.total} présences</span>
                  </div>
                </div>

                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </button>

              {/* Expanded Body */}
              {open && (
                <>
                  <div style={{ height: 1, background: '#E2E8F0', margin: '0 24px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {/* Left: Skills */}
                    <div style={{ padding: 24, borderRight: '1px solid #E2E8F0' }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.85rem', color: NAVY, marginBottom: 16 }}>Compétences clés</div>
                      {r.competences.map(c => <SkillBar key={c.label} label={c.label} val={c.val} />)}
                    </div>

                    {/* Right: Score ring & comment */}
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <ScoreRing note={r.note} />
                        <div>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.85rem', color: NAVY }}>Assiduité aux cours</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10B981', marginTop: 2 }}>{attendancePct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({r.presences}/{r.total} séances)</span></div>
                        </div>
                      </div>

                      <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, borderLeft: `3px solid ${GOLD}` }}>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.75rem', color: NAVY, marginBottom: 4 }}>Appréciation du formateur</div>
                        <p style={{ fontSize: '.8rem', color: '#475569', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                          "{r.commentaire}"
                        </p>
                      </div>

                      <button
                        onClick={() => downloadSingleReport(r)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: '10px',
                          borderRadius: 8,
                          border: 'none',
                          background: BLUE,
                          color: '#fff',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: '.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Télécharger le rapport PDF
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
