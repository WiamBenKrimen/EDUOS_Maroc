'use client'
import { useState } from 'react'

const NAVY = '#1B3A6B'
const GOLD  = '#C9922A'

const RAPPORTS = [
  {
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
      { label: 'Expression écrite',   val: 65 },
      { label: 'Vocabulaire',         val: 79 },
      { label: 'Grammaire',           val: 74 },
    ],
  },
  {
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
      { label: 'Expression écrite',   val: 60 },
      { label: 'Vocabulaire',         val: 75 },
      { label: 'Grammaire',           val: 68 },
    ],
  },
]

function noteColor(n: number) {
  if (n >= 80) return '#059669'
  if (n >= 65) return NAVY
  return GOLD
}

function ScoreRing({ note }: { note: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (note / 100) * circ
  const color = noteColor(note)
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(27,58,107,.08)" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .8s ease' }}
      />
      <text
        x="50" y="56"
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
        fill="#9AABBC"
        fontSize="8"
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
  const color = val >= 75 ? '#059669' : val >= 60 ? NAVY : GOLD
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '.78rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '.78rem', fontWeight: 800, color }}>
          {val}%
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(27,58,107,.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 99, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  )
}

export default function RapportsParticipantPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  const avgNote = Math.round(RAPPORTS.reduce((s, r) => s + r.note, 0) / RAPPORTS.length)
  const totalPresences = RAPPORTS.reduce((s, r) => s + r.presences, 0)
  const totalSeances   = RAPPORTS.reduce((s, r) => s + r.total, 0)
  const presencePct    = Math.round((totalPresences / totalSeances) * 100)

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>EDUOS</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: NAVY }}>Mes rapports</span>
          </div>
          <h1 className="page-title">Rapports de suivi</h1>
          <p className="page-subtitle">Évaluations pédagogiques · Anglais B2 · Formateur K. Alaoui</p>
        </div>
        <div className="page-header-actions">
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, border: `1.5px solid rgba(27,58,107,.15)`, background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.8rem', color: NAVY, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Tout exporter
          </button>
        </div>
      </div>

      {/* ── KPI summary row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {/* Moyenne */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(27,58,107,.08)', boxShadow: '0 2px 12px rgba(27,58,107,.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(27,58,107,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: NAVY, letterSpacing: '-.04em', lineHeight: 1 }}>{avgNote}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#9AABBC' }}>/100</span></div>
            <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>Moyenne générale</div>
          </div>
        </div>

        {/* Présence */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(27,58,107,.08)', boxShadow: '0 2px 12px rgba(27,58,107,.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(5,150,105,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#059669', letterSpacing: '-.04em', lineHeight: 1 }}>{presencePct}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#9AABBC' }}>%</span></div>
            <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>Taux de présence — {totalPresences}/{totalSeances} séances</div>
          </div>
        </div>

        {/* Rapports disponibles */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(27,58,107,.08)', boxShadow: '0 2px 12px rgba(27,58,107,.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(201,146,42,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.6rem', color: GOLD, letterSpacing: '-.04em', lineHeight: 1 }}>{RAPPORTS.length}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#9AABBC' }}> rapports</span></div>
            <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>Évaluations reçues à ce jour</div>
          </div>
        </div>
      </div>

      {/* ── Report cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {RAPPORTS.map((r, i) => {
          const open = expanded === i
          const attendancePct = Math.round((r.presences / r.total) * 100)
          const nc = noteColor(r.note)
          return (
            <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(27,58,107,.09)', boxShadow: '0 2px 14px rgba(27,58,107,.06)', overflow: 'hidden', transition: 'box-shadow .2s' }}>

              {/* Card header — always visible, clickable */}
              <button
                onClick={() => setExpanded(open ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '20px 28px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                {/* Score badge */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${nc}12`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${nc}20` }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.05rem', color: nc, lineHeight: 1 }}>{r.note}</span>
                  <span style={{ fontSize: '.55rem', fontWeight: 700, color: '#9AABBC', letterSpacing: '.03em' }}>/100</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0F2347' }}>Rapport de suivi — {r.mois}</span>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: r.trendUp ? '#059669' : GOLD, background: r.trendUp ? 'rgba(5,150,105,.09)' : 'rgba(201,146,42,.1)', borderRadius: 99, padding: '2px 9px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {r.trendUp ? '▲' : '▼'} {r.trendLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '.75rem', color: '#64748b' }}>
                      Formateur : <strong style={{ color: '#374151' }}>{r.formateur}</strong>
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
                    <span style={{ fontSize: '.75rem', color: '#64748b' }}>Généré le {r.date}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
                    <span style={{ fontSize: '.75rem', color: '#64748b' }}>{r.presences}/{r.total} présences</span>
                  </div>
                </div>

                {/* Expand chevron */}
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F2F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#64748b', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </button>

              {/* Expanded body */}
              {open && (
                <>
                  <div style={{ height: 1, background: 'rgba(27,58,107,.07)', margin: '0 28px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

                    {/* Left — Competences */}
                    <div style={{ padding: '24px 28px', borderRight: '1px solid rgba(27,58,107,.07)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(27,58,107,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        </div>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#1a1823' }}>Compétences évaluées</span>
                      </div>
                      {r.competences.map(c => <SkillBar key={c.label} label={c.label} val={c.val} />)}
                    </div>

                    {/* Right — Score ring + attendance + comment */}
                    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                      {/* Score ring + attendance side by side */}
                      <div style={{ display: 'flex', gap: 20 }}>
                        {/* Score ring */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <ScoreRing note={r.note} />
                          <span style={{ fontSize: '.7rem', color: '#94a3b8', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Note globale</span>
                        </div>

                        {/* Attendance */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(5,150,105,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#1a1823' }}>Présences</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#059669', lineHeight: 1 }}>{r.presences}</span>
                            <span style={{ fontSize: '.9rem', color: '#9AABBC', fontWeight: 600 }}>/{r.total}</span>
                            <span style={{ fontSize: '.75rem', color: '#64748b', marginLeft: 4 }}>séances</span>
                          </div>
                          {/* Mini attendance bar */}
                          <div style={{ height: 8, borderRadius: 99, background: 'rgba(5,150,105,.1)', overflow: 'hidden', marginBottom: 8 }}>
                            <div style={{ height: '100%', width: `${attendancePct}%`, background: '#059669', borderRadius: 99, transition: 'width .7s ease' }} />
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {Array.from({ length: r.total }, (_, k) => (
                              <div key={k} style={{ width: 8, height: 8, borderRadius: 2, background: k < r.presences ? '#059669' : 'rgba(27,58,107,.12)' }} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <div style={{ background: '#FAFBFC', borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${GOLD}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.75rem', color: '#374151' }}>Commentaire du formateur</span>
                        </div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '.8rem', color: '#4B5563', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>
                          "{r.commentaire}"
                        </p>
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '.7rem', color: '#9AABBC', marginTop: 8, marginBottom: 0, fontWeight: 600 }}>— {r.formateur}</p>
                      </div>

                      {/* Download */}
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1.5px solid rgba(27,58,107,.15)`, background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.8rem', color: NAVY, cursor: 'pointer', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EBF0FA')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
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
