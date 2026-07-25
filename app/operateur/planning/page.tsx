'use client'
import { useState } from 'react'

const NAVY = '#1B3A6B'
const NAVY_DARK = '#0F2347'
const GOLD = '#C9922A'

const DAYS = [
  { label: 'Lun', date: '20 Jan' },
  { label: 'Mar', date: '21 Jan' },
  { label: 'Mer', date: '22 Jan' },
  { label: 'Jeu', date: '23 Jan' },
  { label: 'Ven', date: '24 Jan' },
  { label: 'Sam', date: '25 Jan' },
  { label: 'Dim', date: '26 Jan' },
]

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 to 20

const SESSIONS = [
  { day: 0, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', formateur: 'M. Karimi', color: NAVY, bg: 'rgba(27,58,107,.09)' },
  { day: 2, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', formateur: 'M. Karimi', color: NAVY, bg: 'rgba(27,58,107,.09)' },
  { day: 4, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', formateur: 'M. Karimi', color: NAVY, bg: 'rgba(27,58,107,.09)' },
  { day: 1, startH: 10, endH: 12, name: 'Maths Avancés', room: 'Salle 2', formateur: 'Mme Alami', color: GOLD, bg: 'rgba(201,146,42,.09)' },
  { day: 3, startH: 10, endH: 12, name: 'Maths Avancés', room: 'Salle 2', formateur: 'Mme Alami', color: GOLD, bg: 'rgba(201,146,42,.09)' },
  { day: 5, startH: 9, endH: 13, name: 'Espagnol Déb.', room: 'Salle 3', formateur: 'M. El Fassi', color: '#059669', bg: 'rgba(5,150,105,.09)' },
  { day: 0, startH: 17, endH: 19, name: 'Français A2', room: 'Salle 1', formateur: 'Mme Bennouna', color: '#7C3AED', bg: 'rgba(124,58,237,.08)' },
  { day: 2, startH: 17, endH: 19, name: 'Français A2', room: 'Salle 1', formateur: 'Mme Bennouna', color: '#7C3AED', bg: 'rgba(124,58,237,.08)' },
  { day: 1, startH: 14, endH: 16, name: 'Marketing Digital', room: 'Salle 4', formateur: 'M. Chraibi', color: '#DC2626', bg: 'rgba(220,38,38,.08)' },
  { day: 4, startH: 18, endH: 20, name: 'Gestion Projet', room: 'Salle 2', formateur: 'M. Tahiri', color: '#0891b2', bg: 'rgba(8,145,178,.08)' },
]

const CELL_H = 52
const HEADER_H = 56
const GUTTER = 56

export default function PlanningPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const TODAY_IDX = 0 // Monday = today

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 26, color: NAVY_DARK, marginBottom: 4 }}>Planning hebdomadaire</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Semaine du 20 au 26 janvier 2025</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid rgba(27,58,107,.12)', borderRadius: 9, padding: 4 }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{ width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NAVY }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button style={{ padding: '0 12px', borderRadius: 6, border: 'none', background: 'rgba(27,58,107,.06)', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12.5, color: NAVY }}>
              Aujourd'hui
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} style={{ width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NAVY }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 9, border: 'none', background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,58,107,.25)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter une session
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(27,58,107,.08)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(27,58,107,.06)' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)`, borderBottom: '2px solid rgba(27,58,107,.08)' }}>
          <div style={{ background: '#F5F6F8' }} />
          {DAYS.map((d, i) => {
            const isToday = i === TODAY_IDX
            return (
              <div key={d.label} style={{ padding: '14px 8px', textAlign: 'center', background: isToday ? 'rgba(27,58,107,.04)' : '#F5F6F8', borderLeft: '1px solid rgba(27,58,107,.06)', borderRight: i === 6 ? 'none' : undefined }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? NAVY : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>{d.label}</div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isToday ? NAVY : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: isToday ? '#fff' : '#374151' }}>{d.date.split(' ')[0]}</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>jan.</div>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div style={{ position: 'relative', overflowY: 'auto', maxHeight: 620 }}>
          {/* Hour rows */}
          {HOURS.map((h, hi) => (
            <div key={h} style={{ display: 'grid', gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)`, height: CELL_H, borderBottom: '1px solid rgba(27,58,107,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 7, borderRight: '1px solid rgba(27,58,107,.08)' }}>
                <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 500 }}>{h}h</span>
              </div>
              {DAYS.map((_, di) => (
                <div key={di} style={{ borderLeft: '1px solid rgba(27,58,107,.05)', background: di === TODAY_IDX ? 'rgba(27,58,107,.015)' : 'transparent' }} />
              ))}
            </div>
          ))}

          {/* Session blocks */}
          {SESSIONS.map((s, si) => {
            const topPx = (s.startH - 8) * CELL_H + 1
            const heightPx = (s.endH - s.startH) * CELL_H - 3
            const leftPct = s.day / 7
            const widthPct = 1 / 7
            return (
              <div key={si} style={{
                position: 'absolute',
                top: topPx,
                left: `calc(${GUTTER}px + ${leftPct * 100}% - ${leftPct * GUTTER}px + 4px)`,
                width: `calc(${widthPct * 100}% - 8px)`,
                height: heightPx,
                background: s.bg,
                border: `1.5px solid ${s.color}22`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: `0 2px 8px ${s.color}18`,
              }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12, color: s.color, lineHeight: 1.3, marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{s.room}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{s.formateur}</div>
                {heightPx > 80 && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: 600 }}>{s.startH}h – {s.endH}h</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 18, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Légende :</span>
        {[
          { label: 'Anglais', color: NAVY },
          { label: 'Maths', color: GOLD },
          { label: 'Espagnol', color: '#059669' },
          { label: 'Français', color: '#7C3AED' },
          { label: 'Marketing', color: '#DC2626' },
          { label: 'Management', color: '#0891b2' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
