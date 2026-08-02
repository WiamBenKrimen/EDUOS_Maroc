'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────
type Seance = {
  id: string
  titre: string
  description: string | null
  starts_at: string
  ends_at: string
  salle: string | null
  statut: string
  cohorte: string
  formation: string
  formateur: string | null
  online_status?: 'active' | 'ended' | null
  meeting_url?: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const JOURS_COURT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MOIS_COURT = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc']

// Grid spans 7h → 20h (13 hours × 60px = 780px)
const DAY_START_H = 7
const DAY_END_H   = 20
const HOUR_PX     = 64   // pixels per hour

// Palette — sessions get consistent colour per titre hash
const PALETTE = [
  { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', strip: '#2563EB' },
  { bg: '#F0FDF4', border: '#86EFAC', text: '#14532D', strip: '#16A34A' },
  { bg: '#FDF4FF', border: '#E9D5FF', text: '#6B21A8', strip: '#9333EA' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#7C2D12', strip: '#EA580C' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#881337', strip: '#E11D48' },
  { bg: '#F0F9FF', border: '#BAE6FD', text: '#0C4A6E', strip: '#0284C7' },
  { bg: '#FEFCE8', border: '#FEF08A', text: '#713F12', strip: '#CA8A04' },
  { bg: '#F0FDFA', border: '#99F6E4', text: '#134E4A', strip: '#0D9488' },
]

function colorFor(titre: string) {
  let h = 0
  for (let i = 0; i < titre.length; i++) h = ((h << 5) - h + titre.charCodeAt(i)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function startOfWeek(d: Date) {
  const c = new Date(d); c.setHours(0,0,0,0)
  const day = c.getDay()
  c.setDate(c.getDate() - (day === 0 ? 6 : day - 1))
  return c
}
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate()+n); return c }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}
function fmtTime(d: Date) { return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }

function topPx(d: Date) {
  const h = d.getHours() + d.getMinutes()/60
  return Math.max(0, (h - DAY_START_H) * HOUR_PX)
}
function heightPx(start: Date, end: Date) {
  const mins = (end.getTime() - start.getTime()) / 60000
  return Math.max(24, (mins / 60) * HOUR_PX)
}

function statutLabel(s: string) {
  switch(s) {
    case 'planifiee': return 'Planifiée'
    case 'en_cours':  return 'En cours'
    case 'terminee':  return 'Terminée'
    case 'reportee':  return 'Reportée'
    default:          return s
  }
}

// ── Session Block ──────────────────────────────────────────────────────────────
function SessionBlock({ s, onSelect }: { s: Seance; onSelect: (s: Seance) => void }) {
  const start  = new Date(s.starts_at)
  const end    = new Date(s.ends_at)
  const top    = topPx(start)
  const height = heightPx(start, end)
  const col    = colorFor(s.titre)
  const small  = height < 48
  const isActiveLive = s.online_status === 'active'

  return (
    <div
      onClick={() => onSelect(s)}
      title={`${s.titre} — ${fmtTime(start)} à ${fmtTime(end)}`}
      style={{
        position: 'absolute',
        top: top,
        left: 2,
        right: 2,
        height: height - 2,
        background: isActiveLive ? '#DCFCE7' : col.bg,
        border: `1px solid ${isActiveLive ? '#4ADE80' : col.border}`,
        borderLeft: `3px solid ${isActiveLive ? '#16A34A' : col.strip}`,
        borderRadius: 7,
        padding: small ? '2px 6px' : '5px 8px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all .15s ease',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform='scale(1.015)'; el.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'; el.style.zIndex='10' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform=''; el.style.boxShadow=''; el.style.zIndex='2' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <div style={{ fontSize: small ? 10 : 11, fontWeight: 800, color: isActiveLive ? '#14532D' : col.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
          {s.titre}
        </div>
        {isActiveLive && (
          <span style={{ background: '#16A34A', color: '#fff', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 4, textTransform: 'uppercase', flexShrink: 0 }}>
            LIVE
          </span>
        )}
      </div>
      {!small && (
        <>
          <div style={{ fontSize: 9.5, color: isActiveLive ? '#15803D' : col.strip, fontWeight: 700, marginTop: 1 }}>
            {fmtTime(start)} – {fmtTime(end)}
          </div>
          {s.salle && height > 64 && (
            <div style={{ fontSize: 9.5, color: col.text, opacity: .7, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              📍 {s.salle}
            </div>
          )}
          {s.formateur && height > 80 && (
            <div style={{ fontSize: 9.5, color: col.text, opacity: .65, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              👤 {s.formateur}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ s, onClose }: { s: Seance; onClose: () => void }) {
  const [joining, setJoining] = useState(false)
  const [error, setError]     = useState('')
  const start = new Date(s.starts_at)
  const end   = new Date(s.ends_at)
  const col   = colorFor(s.titre)
  const dur   = Math.round((end.getTime()-start.getTime())/60000)
  const dayLabel = `${JOURS[(start.getDay()+6)%7]} ${start.getDate()} ${MOIS_FR[start.getMonth()]} ${start.getFullYear()}`
  const isActiveLive = s.online_status === 'active'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key==='Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleJoin() {
    setJoining(true)
    setError('')
    try {
      const res = await api.post<{ meeting_url: string }>(`/participant/online-sessions/${s.id}/join`, {})
      window.open(res.meeting_url, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de rejoindre la séance.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(15,35,71,.35)', backdropFilter:'blur(4px)', zIndex:1000, display:'grid', placeItems:'center', padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#FFFFFF', borderRadius:20, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,.2)', overflow:'hidden' }}
      >
        {/* Header */}
        <div style={{ background: isActiveLive ? '#DCFCE7' : col.bg, borderBottom:`2px solid ${isActiveLive ? '#86EFAC' : col.border}`, padding:'20px 24px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div style={{ flex:1, paddingRight:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background: isActiveLive ? '#16A34A' : col.strip, display:'inline-block' }} />
              <span style={{ fontSize:11, fontWeight:800, color: isActiveLive ? '#15803D' : col.strip, textTransform:'uppercase', letterSpacing:'.06em' }}>
                {isActiveLive ? '🟢 EN DIRECT SUR GOOGLE MEET' : statutLabel(s.statut)}
              </span>
            </div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#0F2347', lineHeight:1.2 }}>{s.titre}</h2>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #E2E8F0', background:'#FFFFFF', cursor:'pointer', display:'grid', placeItems:'center', color:'#64748B', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 6-12 12M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
          {/* Active Live Google Meet banner */}
          {isActiveLive && (
            <div style={{ padding: '14px 16px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #86EFAC', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                La visioconférence est en cours. En cliquant ci-dessous, votre présence sera automatiquement enregistrée !
              </div>
              {error && <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{error}</div>}
              <button
                onClick={handleJoin}
                disabled={joining}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 10 5-3v10l-5-3v4H4V6h11v4z"/></svg>
                {joining ? 'Connexion en cours…' : 'Rejoindre le cours Google Meet'}
              </button>
            </div>
          )}

          {/* Date */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E2E8F0' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:col.bg, border:`1px solid ${col.border}`, display:'grid', placeItems:'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={col.strip} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#0F2347' }}>{dayLabel}</div>
              <div style={{ fontSize:12, color:'#64748B', fontWeight:600 }}>{fmtTime(start)} → {fmtTime(end)} <span style={{ color:'#94A3B8' }}>({dur} min)</span></div>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { icon:'📍', label:'Salle', value:s.salle||'Non précisée' },
              { icon:'👤', label:'Formateur', value:s.formateur||'Non affecté' },
              { icon:'🎓', label:'Formation', value:s.formation },
              { icon:'👥', label:'Groupe', value:s.cohorte },
            ].map(item => (
              <div key={item.label} style={{ padding:'10px 12px', background:'#F8FAFC', borderRadius:10, border:'1px solid #F1F5F9' }}>
                <div style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0F2347' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {s.description && (
            <div style={{ padding:'12px 14px', background:'#FAFBFF', borderRadius:10, border:'1px solid #E2E8F0' }}>
              <div style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>📝 Description</div>
              <p style={{ margin:0, fontSize:12.5, color:'#475569', lineHeight:1.6 }}>{s.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function EmploiDuTempsPage() {
  const [seances,   setSeances]   = useState<Seance[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [selected,  setSelected]  = useState<Seance|null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to 8h on load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - DAY_START_H) * HOUR_PX - 10
    }
  }, [loading])

  useEffect(() => {
    api.get<Seance[]>('/participant/schedule')
      .then(r => setSeances(Array.isArray(r) ? r : []))
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])

  // Determine display days: Mon-Sat (6 days) or Mon-Fri
  const hasWeekend = useMemo(() => seances.some(s => {
    const d = new Date(s.starts_at).getDay()
    return d === 6
  }), [seances])

  const numDays   = hasWeekend ? 6 : 5
  const weekDays  = useMemo(() => Array.from({ length: numDays }, (_, i) => addDays(weekStart, i)), [weekStart, numDays])

  // Group seances by day
  const byDay = useMemo(() => {
    const map: Record<string, Seance[]> = {}
    ;(seances ?? []).forEach(s => {
      const d   = new Date(s.starts_at)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [seances])

  function dayKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }

  const prevWeek = () => setWeekStart(w => addDays(w, -7))
  const nextWeek = () => setWeekStart(w => addDays(w, 7))
  const goToday  = () => setWeekStart(startOfWeek(new Date()))

  // Hour labels
  const hours = Array.from({ length: DAY_END_H - DAY_START_H + 1 }, (_, i) => DAY_START_H + i)

  // Total height of the grid
  const gridH = (DAY_END_H - DAY_START_H) * HOUR_PX

  // Week metadata
  const weekLabel = `${weekDays[0].getDate()} ${MOIS_COURT[weekDays[0].getMonth()]} – ${weekDays[numDays-1].getDate()} ${MOIS_COURT[weekDays[numDays-1].getMonth()]} ${weekDays[numDays-1].getFullYear()}`

  // Sessions in current week
  const weekSeances = useMemo(() => seances.filter(s => {
    const d = new Date(s.starts_at)
    return d >= weekDays[0] && d < addDays(weekDays[numDays-1], 1)
  }), [seances, weekDays, numDays])

  const cohorte   = seances[0]?.cohorte   ?? ''
  const formation = seances[0]?.formation ?? ''

  // Current time indicator position (only if today is in current week)
  const nowInWeek = weekDays.some(d => isSameDay(d, today))
  const nowDate   = new Date()
  const nowTop    = topPx(nowDate)
  const todayIdx  = weekDays.findIndex(d => isSameDay(d, today))

  const COL_W = 90  // px per day column (approx, CSS flex handles the rest)
  const TIME_COL_W = 52

  return (
    <>
      {selected && <DetailModal s={selected} onClose={() => setSelected(null)} />}

      <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:"'Inter', system-ui, sans-serif", background:'#F8FAFC', minHeight:'calc(100vh - 60px)' }}>

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <div style={{ padding:'16px 24px', background:'#FFFFFF', borderBottom:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>

          {/* Title */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg, #0F2347 0%, #2563EB 100%)', display:'grid', placeItems:'center', flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#0F2347' }}>Emploi du Temps</h1>
              {(cohorte || formation) && (
                <div style={{ fontSize:11.5, color:'#64748B', fontWeight:600, marginTop:1 }}>
                  <span style={{ color:'#2563EB', fontWeight:700 }}>{cohorte}</span>{formation ? ` · ${formation}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div style={{ width:1, height:32, background:'#E2E8F0', margin:'0 4px' }} />

          {/* Week navigation */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button
              onClick={prevWeek}
              style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #E2E8F0', background:'#F8FAFC', cursor:'pointer', display:'grid', placeItems:'center', color:'#475569', transition:'all .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#FFFFFF')}
              onMouseLeave={e=>(e.currentTarget.style.background='#F8FAFC')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <div style={{ padding:'0 14px', height:34, border:'1.5px solid #E2E8F0', borderRadius:9, background:'#FFFFFF', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700, color:'#0F2347', minWidth:200, justifyContent:'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {weekLabel}
            </div>

            <button
              onClick={nextWeek}
              style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #E2E8F0', background:'#F8FAFC', cursor:'pointer', display:'grid', placeItems:'center', color:'#475569', transition:'all .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#FFFFFF')}
              onMouseLeave={e=>(e.currentTarget.style.background='#F8FAFC')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <button
              onClick={goToday}
              style={{ padding:'0 14px', height:34, borderRadius:9, border:'1.5px solid #2563EB', background:'#EFF6FF', cursor:'pointer', fontSize:12.5, fontWeight:700, color:'#2563EB', transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#2563EB';e.currentTarget.style.color='#FFFFFF'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#EFF6FF';e.currentTarget.style.color='#2563EB'}}
            >
              Aujourd'hui
            </button>
          </div>

          {/* Stats */}
          {weekSeances.length > 0 && (
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
              {[
                { label:`${weekSeances.length} séance${weekSeances.length>1?'s':''} cette semaine`, color:'#2563EB', bg:'#EFF6FF' },
                { label:`${seances.filter(s=>s.statut==='planifiee').length} planifiée${seances.filter(s=>s.statut==='planifiee').length>1?'s':''}`, color:'#16A34A', bg:'#F0FDF4' },
              ].map(tag => (
                <span key={tag.label} style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, color:tag.color, background:tag.bg }}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading / Error / Empty ─────────────────────────────────────── */}
        {loading && (
          <div style={{ flex:1, display:'grid', placeItems:'center', flexDirection:'column' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #E2E8F0', borderTop:'3px solid #2563EB', animation:'rapport-spin .8s linear infinite' }} />
              <span style={{ fontSize:13, color:'#94A3B8', fontWeight:600 }}>Chargement de votre emploi du temps…</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div style={{ margin:'24px', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:12, padding:'16px 20px', color:'#BE123C', fontSize:13, fontWeight:600 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && seances.length === 0 && (
          <div style={{ flex:1, display:'grid', placeItems:'center' }}>
            <div style={{ textAlign:'center', padding:40 }}>
              <div style={{ fontSize:56, marginBottom:16 }}>📅</div>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#0F2347', margin:'0 0 8px' }}>Aucune séance planifiée</h2>
              <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>Votre emploi du temps apparaîtra ici dès qu'une séance sera programmée pour votre groupe.</p>
            </div>
          </div>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {!loading && !error && seances.length > 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Day headers (sticky) */}
            <div style={{ display:'flex', background:'#FFFFFF', borderBottom:'2px solid #E2E8F0', flexShrink:0 }}>
              {/* Time gutter header */}
              <div style={{ width:TIME_COL_W, flexShrink:0, borderRight:'1px solid #E2E8F0', background:'#F8FAFC' }} />
              {/* Day columns */}
              {weekDays.map((day, idx) => {
                const isToday  = isSameDay(day, today)
                const sessions = (byDay[dayKey(day)] ?? []).length
                return (
                  <div key={idx} style={{ flex:1, padding:'10px 0', textAlign:'center', borderRight: idx < numDays-1 ? '1px solid #E2E8F0' : 'none', background: isToday ? '#EFF6FF' : '#FFFFFF', position:'relative' }}>
                    {isToday && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'#2563EB', borderRadius:'0 0 3px 3px' }} />}
                    <div style={{ fontSize:10.5, fontWeight:700, color: isToday ? '#2563EB' : '#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>
                      {JOURS_COURT[idx]}
                    </div>
                    <div style={{ fontSize:22, fontWeight:800, color: isToday ? '#2563EB' : '#0F2347', lineHeight:1 }}>
                      {day.getDate()}
                    </div>
                    <div style={{ fontSize:10, fontWeight:600, color: isToday ? '#93C5FD' : '#CBD5E1', marginTop:2 }}>
                      {MOIS_COURT[day.getMonth()]}
                    </div>
                    {sessions > 0 && (
                      <div style={{ marginTop:5 }}>
                        <span style={{ fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:20, background: isToday ? '#DBEAFE' : '#F1F5F9', color: isToday ? '#1D4ED8' : '#64748B' }}>
                          {sessions} cours
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Scrollable grid body */}
            <div ref={scrollRef} style={{ flex:1, overflowY:'auto', overflowX:'auto', position:'relative' }}>
              <div style={{ display:'flex', minWidth: TIME_COL_W + numDays * COL_W }}>

                {/* Time gutter */}
                <div style={{ width:TIME_COL_W, flexShrink:0, position:'relative', borderRight:'1px solid #E2E8F0', background:'#F8FAFC' }}>
                  {hours.map(h => (
                    <div key={h} style={{ position:'absolute', top: (h - DAY_START_H) * HOUR_PX - 8, width:'100%', textAlign:'right', paddingRight:10 }}>
                      <span style={{ fontSize:10.5, fontWeight:700, color:'#94A3B8' }}>
                        {String(h).padStart(2,'0')}:00
                      </span>
                    </div>
                  ))}
                  <div style={{ height: gridH }} />
                </div>

                {/* Day columns */}
                {weekDays.map((day, idx) => {
                  const isToday  = isSameDay(day, today)
                  const sessions = byDay[dayKey(day)] ?? []
                  return (
                    <div key={idx} style={{ flex:1, position:'relative', borderRight: idx < numDays-1 ? '1px solid #E2E8F0' : 'none', background: isToday ? '#FAFCFF' : '#FFFFFF', height: gridH }}>

                      {/* Horizontal hour lines */}
                      {hours.map(h => (
                        <div key={h} style={{ position:'absolute', top:(h-DAY_START_H)*HOUR_PX, left:0, right:0, borderTop: h===DAY_START_H ? 'none' : '1px solid #F1F5F9' }}>
                          {/* Half-hour dashed line */}
                          <div style={{ position:'absolute', top:HOUR_PX/2, left:0, right:0, borderTop:'1px dashed #F5F7FA' }} />
                        </div>
                      ))}

                      {/* Current time indicator */}
                      {isToday && nowInWeek && nowTop >= 0 && nowTop <= gridH && (
                        <div style={{ position:'absolute', top:nowTop, left:0, right:0, zIndex:5, pointerEvents:'none' }}>
                          <div style={{ height:2, background:'#EF4444', position:'relative' }}>
                            <div style={{ position:'absolute', left:-5, top:-4, width:10, height:10, borderRadius:'50%', background:'#EF4444' }} />
                          </div>
                        </div>
                      )}

                      {/* Sessions */}
                      {sessions.map(s => (
                        <SessionBlock key={s.id} s={s} onSelect={setSelected} />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Legend ───────────────────────────────────────────────────────── */}
        {!loading && !error && seances.length > 0 && (
          <div style={{ padding:'10px 24px', background:'#FFFFFF', borderTop:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.05em' }}>Légende :</span>
            {[
              { label:'Planifiée',  color:'#3B82F6' },
              { label:'En cours',   color:'#10B981' },
              { label:'Reportée',   color:'#F59E0B' },
              { label:'Terminée',   color:'#94A3B8' },
            ].map(item => (
              <span key={item.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#475569', fontWeight:600 }}>
                <span style={{ width:10, height:10, borderRadius:3, background:item.color, display:'inline-block' }} />
                {item.label}
              </span>
            ))}
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#EF4444', fontWeight:600, marginLeft:4 }}>
              <span style={{ width:14, height:2, background:'#EF4444', display:'inline-block', borderRadius:1 }} />
              Heure actuelle
            </span>
            <span style={{ marginLeft:'auto', fontSize:11, color:'#94A3B8' }}>Cliquez sur une séance pour voir les détails</span>
          </div>
        )}
      </div>
    </>
  )
}
