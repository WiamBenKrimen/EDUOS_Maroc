'use client'
import { useState } from 'react'

const NAVY = '#1B3A6B'
const NAVY_DARK = '#0F2347'
const GOLD = '#C9922A'

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(27,58,107,.06)',
  border: '1px solid rgba(27,58,107,.07)',
}

type FilterType = 'Tous' | 'Vidéos' | 'PDF' | 'Exercices' | 'QCM'
const FILTERS: FilterType[] = ['Tous', 'Vidéos', 'PDF', 'Exercices', 'QCM']

interface Resource {
  title: string
  type: FilterType
  meta: string
  size: string
  week: number
  new?: boolean
}

const RESOURCES: Resource[] = [
  { title: 'Cours 3 — Le présent perfect', type: 'Vidéos', meta: '24 min · HD', size: '', week: 3 },
  { title: 'Grammaire B2 — Récapitulatif', type: 'PDF', meta: '18 pages', size: '2.4 MB', week: 3 },
  { title: 'Exercices — Présent perfect', type: 'Exercices', meta: '12 exercices', size: '0.8 MB', week: 3, new: true },
  { title: 'QCM Semaine 3 — Évaluation', type: 'QCM', meta: '20 questions · 30 min', size: '', week: 3 },
  { title: 'Cours 2 — Le prétérit simple', type: 'Vidéos', meta: '19 min · HD', size: '', week: 2 },
  { title: 'Vocabulaire thématique B2', type: 'PDF', meta: '8 pages', size: '1.1 MB', week: 2 },
  { title: 'Exercices — Conjugaison avancée', type: 'Exercices', meta: '10 exercices', size: '0.6 MB', week: 2 },
  { title: 'Cours 1 — Introduction B2', type: 'Vidéos', meta: '15 min · HD', size: '', week: 1 },
  { title: 'QCM Semaine 1 — Diagnostique', type: 'QCM', meta: '15 questions · 20 min', size: '', week: 1 },
]

const TYPE_CONFIG: Record<FilterType | string, { color: string; bg: string; icon: string; action: string }> = {
  Vidéos: { color: '#7C3AED', bg: 'rgba(124,58,237,.1)', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', action: 'Regarder' },
  PDF: { color: '#DC2626', bg: 'rgba(220,38,38,.09)', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', action: 'Télécharger' },
  Exercices: { color: '#059669', bg: 'rgba(5,150,105,.09)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', action: 'Commencer' },
  QCM: { color: GOLD, bg: 'rgba(201,146,42,.09)', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', action: 'Commencer' },
  Tous: { color: NAVY, bg: 'rgba(27,58,107,.08)', icon: '', action: 'Ouvrir' },
}

function ResourceCard({ r }: { r: Resource }) {
  const cfg = TYPE_CONFIG[r.type]
  return (
    <div style={{ ...CARD_STYLE, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      {r.new && (
        <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, color: '#fff', background: GOLD, borderRadius: 99, padding: '2px 8px', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.3px' }}>Nouveau</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: cfg.color }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={cfg.icon} />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: cfg.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.type}</span>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: '#1a1823', lineHeight: 1.35, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {r.title}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{r.meta}</div>
          {r.size && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{r.size}</div>}
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8', background: '#F5F6F8', borderRadius: 6, padding: '3px 8px', fontWeight: 600 }}>Sem. {r.week}</span>
      </div>

      <button style={{
        width: '100%', padding: '10px', borderRadius: 8,
        border: r.type === 'PDF' || r.type === 'Exercices' ? `1.5px solid rgba(27,58,107,.15)` : 'none',
        background: r.type === 'Vidéos' || r.type === 'QCM' ? cfg.color : '#fff',
        color: r.type === 'Vidéos' || r.type === 'QCM' ? '#fff' : cfg.color,
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        boxShadow: r.type === 'Vidéos' || r.type === 'QCM' ? `0 4px 12px ${cfg.color}30` : 'none',
      }}>
        {r.type === 'PDF' || r.type === 'Exercices' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
        {cfg.action}
      </button>
    </div>
  )
}

export default function RessourcesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Tous')

  const filtered = activeFilter === 'Tous' ? RESOURCES : RESOURCES.filter(r => r.type === activeFilter)

  const counts: Record<FilterType, number> = {
    Tous: RESOURCES.length,
    Vidéos: RESOURCES.filter(r => r.type === 'Vidéos').length,
    PDF: RESOURCES.filter(r => r.type === 'PDF').length,
    Exercices: RESOURCES.filter(r => r.type === 'Exercices').length,
    QCM: RESOURCES.filter(r => r.type === 'QCM').length,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 26, color: NAVY_DARK, marginBottom: 4 }}>Ressources du cours</h1>
        <p style={{ fontSize: 13.5, color: '#64748b' }}>Anglais B2 — Niveau intermédiaire · M. Karimi</p>
      </div>

      {/* Progress bar */}
      <div style={{ ...CARD_STYLE, padding: '18px 24px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Ressources consultées ce mois</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>6 / 9</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(27,58,107,.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '67%', background: `linear-gradient(to right, ${NAVY}, #2a5298)`, borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 28, color: NAVY, letterSpacing: '-0.5px' }}>67%</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = activeFilter === f
          const cfg = TYPE_CONFIG[f]
          return (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '8px 16px',
              borderRadius: 99,
              border: active ? 'none' : '1.5px solid rgba(27,58,107,.12)',
              background: active ? (f === 'Tous' ? NAVY : cfg.color) : '#fff',
              color: active ? '#fff' : '#64748b',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all .15s',
              boxShadow: active ? `0 4px 12px ${f === 'Tous' ? 'rgba(27,58,107,.25)' : cfg.color + '35'}` : 'none',
            }}>
              {f}
              <span style={{ background: active ? 'rgba(255,255,255,.25)' : 'rgba(27,58,107,.08)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{counts[f]}</span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {filtered.map((r, i) => <ResourceCard key={i} r={r} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Aucune ressource</div>
          <div style={{ fontSize: 13 }}>Aucune ressource de ce type n'est disponible pour le moment.</div>
        </div>
      )}
    </div>
  )
}
