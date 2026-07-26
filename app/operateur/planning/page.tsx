'use client'

import { useState } from 'react'

const NAVY = '#1B3A6B'
const GOLD = '#C9922A'

const DAYS = [
  { label: 'Lun', date: 20 },
  { label: 'Mar', date: 21 },
  { label: 'Mer', date: 22 },
  { label: 'Jeu', date: 23 },
  { label: 'Ven', date: 24 },
  { label: 'Sam', date: 25 },
  { label: 'Dim', date: 26 },
]

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 to 20

const INITIAL_SESSIONS = [
  { id: 1, day: 0, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', formateur: 'M. Karimi', color: NAVY },
  { id: 2, day: 2, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', formateur: 'M. Karimi', color: NAVY },
  { id: 3, day: 4, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', formateur: 'M. Karimi', color: NAVY },
  { id: 4, day: 1, startH: 10, endH: 12, name: 'Maths Avancés', room: 'Salle 2', formateur: 'Mme Alami', color: GOLD },
  { id: 5, day: 3, startH: 10, endH: 12, name: 'Maths Avancés', room: 'Salle 2', formateur: 'Mme Alami', color: GOLD },
  { id: 6, day: 5, startH: 9, endH: 13, name: 'Espagnol Déb.', room: 'Salle 3', formateur: 'M. El Fassi', color: '#059669' },
  { id: 7, day: 0, startH: 17, endH: 19, name: 'Français A2', room: 'Salle 1', formateur: 'Mme Bennouna', color: '#7C3AED' },
  { id: 8, day: 2, startH: 17, endH: 19, name: 'Français A2', room: 'Salle 1', formateur: 'Mme Bennouna', color: '#7C3AED' },
  { id: 9, day: 1, startH: 14, endH: 16, name: 'Marketing Digital', room: 'Salle 4', formateur: 'M. Chraibi', color: '#DC2626' },
  { id: 10, day: 4, startH: 18, endH: 20, name: 'Gestion Projet', room: 'Salle 2', formateur: 'M. Tahiri', color: '#0891b2' },
]

const CELL_H = 52
const GUTTER = 56

export default function PlanningPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<typeof INITIAL_SESSIONS[0] | null>(null)
  const [roomFilter, setRoomFilter] = useState('Toutes les salles')
  const [toastMessage, setToastMessage] = useState('')

  // New Session Form State
  const [newSession, setNewSession] = useState({
    name: 'Nouvelle Session',
    room: 'Salle 1',
    formateur: 'M. Karimi',
    day: 0,
    startH: 10,
    endH: 12,
    color: '#1B3A6B'
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleAddSession = () => {
    const created = {
      id: Date.now(),
      ...newSession,
    }
    setSessions(prev => [...prev, created])
    setShowAddModal(false)
    triggerToast(`Session "${created.name}" ajoutée au planning !`)
  }

  const handleDeleteSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    setSelectedSession(null)
    triggerToast('Session supprimée du planning.')
  }

  const filteredSessions = sessions.filter(s => roomFilter === 'Toutes les salles' || s.room === roomFilter)

  return (
    <div>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#0F2347', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(15,35,71,.3)' }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="op-page-header">
        <div>
          <div className="op-breadcrumb">
            <span>Opérateur</span>
            <span className="op-breadcrumb-sep">›</span>
            <span className="op-breadcrumb-active">Planning</span>
          </div>
          <h1 className="op-page-title">Planning hebdomadaire</h1>
          <p className="op-page-subtitle">Visualisez et gérez les sessions planifiées.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="search-input" style={{ width: 160, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFF' }}>
            <option>Toutes les salles</option>
            <option>Salle 1</option>
            <option>Salle 2</option>
            <option>Salle 3</option>
            <option>Salle 4</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 8px' }}>
            <button onClick={() => setWeekOffset(w => w - 1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span style={{ fontSize: '.84rem', fontWeight: 600, color: '#0F2347', display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {20 + weekOffset * 7} - {26 + weekOffset * 7} janv. 2025
            </span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <button className="btn-gold" onClick={() => setShowAddModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter une session
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="op-card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)`, borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
          <div />
          {DAYS.map((d) => (
            <div key={d.label} style={{ padding: '14px 8px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '.05em' }}>{d.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '.95rem', color: '#0F2347', marginTop: 2 }}>{d.date + weekOffset * 7} JAN</div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)` }}>
          {/* Time Labels */}
          <div>
            {HOURS.map(h => (
              <div key={h} style={{ height: CELL_H, paddingRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '.72rem', color: '#94A3B8', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {h < 10 ? `0${h}:00` : `${h}:00`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {DAYS.map((d, dayIdx) => (
            <div key={d.label} style={{ position: 'relative', height: HOURS.length * CELL_H, borderLeft: '1px solid #F1F5F9' }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: CELL_H, borderBottom: '1px solid #F1F5F9' }} />
              ))}

              {/* Sessions on this day */}
              {filteredSessions.filter(s => s.day === dayIdx).map(s => {
                const topPx = (s.startH - 8) * CELL_H + 2
                const heightPx = (s.endH - s.startH) * CELL_H - 4
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSession(s)}
                    style={{
                      position: 'absolute',
                      top: topPx, left: 4, right: 4, height: heightPx,
                      background: '#FFFFFF',
                      borderLeft: `4px solid ${s.color}`,
                      borderRadius: 8,
                      padding: '8px 10px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                      border: '1px solid #E2E8F0',
                      zIndex: 10,
                      transition: 'transform .14s, box-shadow .14s',
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '.82rem', color: s.color }}>{s.name}</div>
                    <div style={{ fontSize: '.74rem', color: '#475569', marginTop: 2 }}>{s.room} - {s.formateur}</div>
                    <div style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 2 }}>{s.startH < 10 ? `0${s.startH}` : s.startH}:00 - {s.endH < 10 ? `0${s.endH}` : s.endH}:00</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: '#475569' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1B3A6B' }} />
          <span>Langues</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: '#475569' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} />
          <span>Mathématiques</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: '#475569' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} />
          <span>Digital</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: '#475569' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }} />
          <span>Gestion</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: '#475569' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748B' }} />
          <span>Autres</span>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="op-card" style={{ width: '100%', maxWidth: 460, padding: '24px' }}>
            <div className="row-between" style={{ marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F2347' }}>Ajouter une session de cours</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Nom du cours</label>
                <input className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newSession.name} onChange={e => setNewSession(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="section-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Salle</label>
                  <select className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newSession.room} onChange={e => setNewSession(prev => ({ ...prev, room: e.target.value }))}>
                    <option>Salle 1</option>
                    <option>Salle 2</option>
                    <option>Salle 3</option>
                    <option>Salle 4</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Formateur</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newSession.formateur} onChange={e => setNewSession(prev => ({ ...prev, formateur: e.target.value }))} />
                </div>
              </div>

              <div className="section-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Jour</label>
                  <select className="search-input" style={{ width: '100%', padding: '10px 8px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newSession.day} onChange={e => setNewSession(prev => ({ ...prev, day: Number(e.target.value) }))}>
                    {DAYS.map((d, i) => <option key={d.label} value={i}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Début (h)</label>
                  <input type="number" min={8} max={19} className="search-input" style={{ width: '100%', padding: '10px 8px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newSession.startH} onChange={e => setNewSession(prev => ({ ...prev, startH: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Fin (h)</label>
                  <input type="number" min={9} max={20} className="search-input" style={{ width: '100%', padding: '10px 8px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newSession.endH} onChange={e => setNewSession(prev => ({ ...prev, endH: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Couleur</label>
                <div className="row" style={{ gap: 10 }}>
                  {['#1B3A6B', '#D97706', '#059669', '#7C3AED', '#DC2626', '#0891b2'].map(color => (
                    <div
                      key={color}
                      onClick={() => setNewSession(prev => ({ ...prev, color }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: color, cursor: 'pointer', border: newSession.color === color ? '3px solid #0F2347' : 'none' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 24, justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn-gold" style={{ padding: '8px 16px' }} onClick={handleAddSession}>Valider la session</button>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="op-card" style={{ width: '100%', maxWidth: 400, padding: '24px' }}>
            <div className="row-between" style={{ marginBottom: 14 }}>
              <span className="badge badge-navy">{selectedSession.room}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSession(null)}>✕</button>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 6, color: selectedSession.color }}>{selectedSession.name}</h2>
            <p style={{ fontSize: '.84rem', color: '#64748B', marginBottom: 16 }}>{DAYS[selectedSession.day].label} · {selectedSession.startH}h00 à {selectedSession.endH}h00 · Formateur: {selectedSession.formateur}</p>

            <div className="row" style={{ gap: 10, marginTop: 20 }}>
              <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '10px' }} onClick={() => handleDeleteSession(selectedSession.id)}>
                Supprimer session
              </button>
              <button className="btn-navy btn-sm" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={() => setSelectedSession(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
