'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const INITIAL_COHORTES = [
  { id: 1, name: 'Anglais B1 — Matin', formateur: 'Karim Alaoui', eleves: 18, max: 20, sessions: 'Lun / Mer / Ven 9h–11h', debut: 'Sept. 2025' },
  { id: 2, name: 'Français A2 — Soir', formateur: 'Laila Bennouna', eleves: 14, max: 16, sessions: 'Mar / Jeu 18h–20h', debut: 'Oct. 2025' },
  { id: 3, name: 'Espagnol Débutant', formateur: 'Omar El Fassi', eleves: 12, max: 20, sessions: 'Sam 9h–13h', debut: 'Sept. 2025' },
  { id: 4, name: 'Gestion de projet', formateur: 'Sanae Tahiri', eleves: 20, max: 20, sessions: 'Lun / Mer 17h–19h', debut: 'Juil. 2025' },
  { id: 5, name: 'Marketing digital', formateur: 'Youssef Chraibi', eleves: 9, max: 15, sessions: 'Mar / Ven 10h–12h', debut: 'Oct. 2025' },
  { id: 6, name: 'Anglais C1 — Intensif', formateur: 'Nadia Rami', eleves: 8, max: 10, sessions: 'Lun–Ven 8h–10h', debut: 'Août 2025' },
]

function fillColor(pct: number) {
  if (pct >= 95) return '#059669'
  if (pct >= 70) return BLUE
  if (pct >= 50) return GOLD
  return '#DC2626'
}

export default function CohortesPage() {
  const [cohortes, setCohortes] = useState(INITIAL_COHORTES)
  const [toast, setToast] = useState<string | null>(null)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCohorte, setSelectedCohorte] = useState<typeof INITIAL_COHORTES[0] | null>(null)
  const [editCohorte, setEditCohorte] = useState<typeof INITIAL_COHORTES[0] | null>(null)

  // Add Cohort state
  const [newName, setNewName] = useState('')
  const [newFormateur, setNewFormateur] = useState('Karim Alaoui')
  const [newMax, setNewMax] = useState(20)
  const [newSessions, setNewSessions] = useState('Lun / Mer 18h-20h')

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddCohorte = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry = {
      id: Date.now(),
      name: newName,
      formateur: newFormateur,
      eleves: 1,
      max: Number(newMax) || 20,
      sessions: newSessions,
      debut: 'Aujourd\'hui'
    }
    setCohortes([newEntry, ...cohortes])
    setShowAddModal(false)
    triggerToast(`Cohorte "${newName}" créée avec succès !`)
    setNewName('')
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCohorte) return
    setCohortes(prev => prev.map(c => c.id === editCohorte.id ? editCohorte : c))
    setEditCohorte(null)
    triggerToast(`Cohorte "${editCohorte.name}" mise à jour !`)
  }

  const totalEleves = cohortes.reduce((sum, c) => sum + c.eleves, 0)
  const totalPlaces = cohortes.reduce((sum, c) => sum + (c.max - c.eleves), 0)
  const totalComplets = cohortes.filter(c => c.eleves >= c.max).length

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

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Cohortes & Groupes</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Gérez la planification des groupes de formation et suivez les taux de remplissage.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 9,
            border: 'none',
            background: BLUE,
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(27,58,107,0.2)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle cohorte
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Groupes actifs', val: cohortes.length, color: NAVY, bg: '#F1F5F9' },
          { label: 'Total apprenants', val: totalEleves, color: BLUE, bg: '#EEF2FF' },
          { label: 'Places disponibles', val: totalPlaces, color: GOLD, bg: '#FEF3C7' },
          { label: 'Groupes complets', val: totalComplets, color: '#059669', bg: '#ECFDF5' }
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: s.color, marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cohorts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {cohortes.map((c) => {
          const pct = Math.round((c.eleves / c.max) * 100)
          const col = fillColor(pct)
          return (
            <div
              key={c.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 22,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(15,35,71,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: NAVY, margin: 0, lineHeight: 1.3 }}>{c.name}</h3>
                  <span style={{ fontSize: '.7rem', fontWeight: 800, color: col, background: `${col}15`, padding: '3px 9px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {pct}% rempli
                  </span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: '#64748b' }}>Capacité</span>
                    <span style={{ fontWeight: 700, color: col }}>{c.eleves} / {c.max} élèves</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#475569', marginBottom: 18 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Formateur : <strong>{c.formateur}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{c.sessions}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSelectedCohorte(c)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', color: NAVY, fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}
                >
                  Voir le groupe
                </button>
                <button
                  onClick={() => setEditCohorte(c)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}
                >
                  Éditer
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Cohort Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Créer une cohorte</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddCohorte} style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Nom de la cohorte</label>
                <input
                  type="text"
                  placeholder="Ex: Anglais B2 — Soir"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Formateur</label>
                  <input
                    type="text"
                    value={newFormateur}
                    onChange={e => setNewFormateur(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Capacité Max</label>
                  <input
                    type="number"
                    value={newMax}
                    onChange={e => setNewMax(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Planning / Horaires</label>
                <input
                  type="text"
                  placeholder="Lun / Mer 18h-20h"
                  value={newSessions}
                  onChange={e => setNewSessions(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Créer la cohorte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cohort Detail Modal */}
      {selectedCohorte && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Détails : {selectedCohorte.name}</h3>
              <button onClick={() => setSelectedCohorte(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>Formateur référent : <strong>{selectedCohorte.formateur}</strong></div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>Planning : <strong>{selectedCohorte.sessions}</strong></div>
                <div style={{ fontSize: 13, color: '#475569' }}>Remplissage : <strong>{selectedCohorte.eleves} / {selectedCohorte.max} apprenants</strong></div>
              </div>

              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: NAVY, marginBottom: 10 }}>Apprenants inscrits ({selectedCohorte.eleves})</h4>
              <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 20 }}>
                {['Yasmine Benali', 'Karim Belkadi', 'Amine Mansouri', 'Sara El Ouafi'].map((name, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', fontSize: 13, color: NAVY, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{name}</span>
                    <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>Présent à 100%</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedCohorte(null)}
                style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cohort Modal */}
      {editCohorte && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Éditer la cohorte</h3>
              <button onClick={() => setEditCohorte(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Nom de la cohorte</label>
                <input
                  type="text"
                  value={editCohorte.name}
                  onChange={e => setEditCohorte({ ...editCohorte, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Capacité Maximale</label>
                <input
                  type="number"
                  value={editCohorte.max}
                  onChange={e => setEditCohorte({ ...editCohorte, max: Number(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditCohorte(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
