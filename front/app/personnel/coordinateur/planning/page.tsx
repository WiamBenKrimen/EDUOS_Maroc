'use client'

import { useEffect, useMemo, useState } from 'react'
import { getUser } from '../../../../lib/auth'
import { ChangeRequest, DAYS, loadRequests, loadSessions, saveRequests, Session } from '../../../../lib/planning'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)
const CELL_H = 52
const GUTTER = 56

const fieldStyle = { width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, background: '#FFF' }

export default function PlanningPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [sessions, setSessions] = useState<Session[]>([])
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [showRequest, setShowRequest] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ day: 0, startH: 9, endH: 11, reason: '' })
  const user = getUser()

  useEffect(() => {
    setSessions(loadSessions())
    setRequests(loadRequests())
  }, [])

  const mySessions = useMemo(
    () => sessions.filter(session => session.personnelId === (user?.id ?? 'demo-coordinateur')),
    [sessions, user?.id],
  )

  const pendingBySession = (sessionId: number) =>
    requests.find(request => request.sessionId === sessionId && request.personnelId === (user?.id ?? 'demo-coordinateur') && request.status === 'En attente')

  function openRequest(session: Session) {
    setSelectedSession(session)
    setForm({ day: session.day, startH: session.startH, endH: session.endH, reason: '' })
    setShowRequest(true)
  }

  function submitRequest() {
    if (!selectedSession || form.endH <= form.startH) return
    const request: ChangeRequest = {
      id: Date.now(),
      sessionId: selectedSession.id,
      sessionName: selectedSession.name,
      personnelId: user?.id ?? 'demo-coordinateur',
      personnelName: user?.nom ?? 'Sara Alaoui',
      currentDay: selectedSession.day,
      currentStartH: selectedSession.startH,
      currentEndH: selectedSession.endH,
      requestedDay: form.day,
      requestedStartH: form.startH,
      requestedEndH: form.endH,
      reason: form.reason.trim(),
      status: 'En attente',
      createdAt: new Date().toISOString(),
    }
    const next = [request, ...requests]
    setRequests(next)
    saveRequests(next)
    setShowRequest(false)
    setSelectedSession(null)
    setToast('Votre demande a été envoyée au directeur.')
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#0F2347', color: '#fff', padding: '12px 20px', borderRadius: 9, fontWeight: 700, fontSize: '.85rem' }}>{toast}</div>}

      <div className="op-page-header">
        <div>
          <div className="op-breadcrumb"><span>Personnel</span><span className="op-breadcrumb-sep">›</span><span className="op-breadcrumb-active">Planning</span></div>
          <h1 className="op-page-title">Mes séances</h1>
          <p className="op-page-subtitle">Consultez les séances planifiées pour vous par le directeur.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 8px' }}>
          <button aria-label="Semaine précédente" onClick={() => setWeekOffset(w => w - 1)} className="btn btn-ghost btn-sm">‹</button>
          <span style={{ fontSize: '.84rem', fontWeight: 700, color: '#0F2347', padding: '0 8px' }}>{20 + weekOffset * 7} au {26 + weekOffset * 7} janvier 2025</span>
          <button aria-label="Semaine suivante" onClick={() => setWeekOffset(w => w + 1)} className="btn btn-ghost btn-sm">›</button>
        </div>
      </div>

      <div style={{ padding: '12px 16px', marginBottom: 16, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, color: '#1E3A5F', fontSize: '.82rem' }}>
        Le planning est défini par le directeur. Pour modifier un horaire, ouvrez une séance puis envoyez une demande.
      </div>

      <div className="op-card" style={{ overflowX: 'auto', marginBottom: 20 }}>
        <div style={{ minWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)`, borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
            <div />
            {DAYS.map(d => <div key={d.label} style={{ padding: '14px 8px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}><strong style={{ fontSize: '.72rem', color: '#64748B' }}>{d.label}</strong><div style={{ fontWeight: 800, color: '#0F2347', marginTop: 2 }}>{d.date + weekOffset * 7} JAN</div></div>)}
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)` }}>
            <div>{HOURS.map(h => <div key={h} style={{ height: CELL_H, paddingRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '.72rem', color: '#94A3B8' }}>{String(h).padStart(2, '0')}:00</div>)}</div>
            {DAYS.map((day, dayIdx) => (
              <div key={day.label} style={{ position: 'relative', height: HOURS.length * CELL_H, borderLeft: '1px solid #F1F5F9' }}>
                {HOURS.map(h => <div key={h} style={{ height: CELL_H, borderBottom: '1px solid #F1F5F9' }} />)}
                {mySessions.filter(s => s.day === dayIdx).map(s => {
                  const pending = pendingBySession(s.id)
                  return <button key={s.id} onClick={() => openRequest(s)} style={{ position: 'absolute', top: (s.startH - 8) * CELL_H + 2, left: 4, right: 4, height: (s.endH - s.startH) * CELL_H - 4, textAlign: 'left', background: '#FFF', border: '1px solid #E2E8F0', borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                    <strong style={{ display: 'block', fontSize: '.82rem', color: s.color }}>{s.name}</strong>
                    <span style={{ display: 'block', fontSize: '.72rem', color: '#475569', marginTop: 2 }}>{s.room} · {s.startH}h à {s.endH}h</span>
                    {pending && <span style={{ display: 'inline-block', marginTop: 5, fontSize: '.64rem', fontWeight: 700, color: '#92400E', background: '#FEF3C7', padding: '2px 6px', borderRadius: 5 }}>Demande en attente</span>}
                  </button>
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showRequest && selectedSession && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="op-card" style={{ width: '100%', maxWidth: 480, padding: 24 }}>
            <div className="row-between"><div><h2 style={{ fontWeight: 800, color: '#0F2347' }}>Demander un changement</h2><p style={{ fontSize: '.8rem', color: '#64748B', marginTop: 4 }}>{selectedSession.name} · Horaire actuel : {DAYS[selectedSession.day].label} {selectedSession.startH}h à {selectedSession.endH}h</p></div><button className="btn btn-ghost btn-sm" onClick={() => setShowRequest(false)}>Fermer</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 20 }}>
              <label style={{ fontSize: '.76rem', fontWeight: 700, color: '#475569' }}>Jour souhaité<select style={{ ...fieldStyle, marginTop: 5 }} value={form.day} onChange={e => setForm({ ...form, day: Number(e.target.value) })}>{DAYS.map((d, i) => <option value={i} key={d.label}>{d.label}</option>)}</select></label>
              <label style={{ fontSize: '.76rem', fontWeight: 700, color: '#475569' }}>Début<input style={{ ...fieldStyle, marginTop: 5 }} type="number" min="8" max="19" value={form.startH} onChange={e => setForm({ ...form, startH: Number(e.target.value) })} /></label>
              <label style={{ fontSize: '.76rem', fontWeight: 700, color: '#475569' }}>Fin<input style={{ ...fieldStyle, marginTop: 5 }} type="number" min="9" max="20" value={form.endH} onChange={e => setForm({ ...form, endH: Number(e.target.value) })} /></label>
            </div>
            <label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: '#475569', marginTop: 14 }}>Motif<textarea rows={3} placeholder="Expliquez brièvement votre demande" style={{ ...fieldStyle, marginTop: 5, resize: 'vertical' }} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></label>
            {form.endH <= form.startH && <p style={{ color: '#B91C1C', fontSize: '.75rem', marginTop: 8 }}>L’heure de fin doit être après l’heure de début.</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}><button className="btn btn-ghost btn-sm" onClick={() => setShowRequest(false)}>Annuler</button><button className="btn-gold" disabled={form.endH <= form.startH} onClick={submitRequest}>Envoyer au directeur</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
