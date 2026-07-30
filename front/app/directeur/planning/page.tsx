'use client'

import { useEffect, useState } from 'react'
import { ChangeRequest, DAYS, loadRequests, loadSessions, saveRequests, saveSessions, Session } from '../../../lib/planning'

const field = { width: '100%', padding: '9px 11px', border: '1px solid #CBD5E1', borderRadius: 8, background: '#FFF' }
const emptySession = { name: '', room: 'Salle 1', intervenant: 'Karim Alaoui', personnelId: 'demo-coordinateur', personnelName: 'Sara Alaoui', day: 0, startH: 9, endH: 11, color: '#1B3A6B' }

export default function DirectorPlanningPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Session | null>(null)
  const [form, setForm] = useState(emptySession)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setSessions(loadSessions())
    setRequests(loadRequests())
  }, [])

  function notify(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  function openCreate() {
    setEditing(null)
    setForm(emptySession)
    setShowForm(true)
  }

  function openEdit(session: Session) {
    setEditing(session)
    setForm({ name: session.name, room: session.room, intervenant: session.intervenant, personnelId: session.personnelId, personnelName: session.personnelName, day: session.day, startH: session.startH, endH: session.endH, color: session.color })
    setShowForm(true)
  }

  function persistSession() {
    if (!form.name.trim() || form.endH <= form.startH) return
    const next = editing
      ? sessions.map(s => s.id === editing.id ? { ...s, ...form } : s)
      : [...sessions, { id: Date.now(), ...form }]
    setSessions(next)
    saveSessions(next)
    setShowForm(false)
    notify(editing ? 'Séance mise à jour.' : 'Séance ajoutée au planning.')
  }

  function removeSession() {
    if (!editing) return
    const next = sessions.filter(s => s.id !== editing.id)
    setSessions(next)
    saveSessions(next)
    setShowForm(false)
    notify('Séance supprimée.')
  }

  function decide(request: ChangeRequest, approved: boolean) {
    let nextSessions = sessions
    if (approved) {
      nextSessions = sessions.map(s => s.id === request.sessionId ? { ...s, day: request.requestedDay, startH: request.requestedStartH, endH: request.requestedEndH } : s)
      setSessions(nextSessions)
      saveSessions(nextSessions)
    }
    const nextRequests = requests.map(r => r.id === request.id ? { ...r, status: approved ? 'Approuvée' as const : 'Refusée' as const } : r)
    setRequests(nextRequests)
    saveRequests(nextRequests)
    notify(approved ? 'Demande approuvée et planning mis à jour.' : 'Demande refusée.')
  }

  const pendingCount = requests.filter(r => r.status === 'En attente').length

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1200, background: '#0F2347', color: '#FFF', padding: '12px 18px', borderRadius: 9, fontWeight: 700, fontSize: 13 }}>{toast}</div>}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div><p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 5 }}>Directeur / Planning</p><h1 style={{ color: '#0F2347', fontSize: 25, fontWeight: 800 }}>Planning des séances</h1><p style={{ color: '#64748B', fontSize: 13, marginTop: 5 }}>Planifiez les séances et traitez les demandes de changement des opérateurs.</p></div>
        <button className="btn-gold" onClick={openCreate}>Ajouter une séance</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, .75fr)', gap: 18, alignItems: 'start' }}>
        <section className="op-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(95px, 1fr))', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
            {DAYS.map(d => <div key={d.label} style={{ padding: '13px 10px', textAlign: 'center', borderRight: '1px solid #E2E8F0' }}><strong style={{ color: '#64748B', fontSize: 11 }}>{d.label}</strong><div style={{ color: '#0F2347', fontWeight: 800, marginTop: 2 }}>{d.date} JAN</div></div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(95px, 1fr))', minHeight: 540, overflowX: 'auto' }}>
            {DAYS.map((day, index) => <div key={day.label} style={{ padding: 8, borderRight: '1px solid #EEF2F7', background: '#FFF' }}>
              {sessions.filter(s => s.day === index).sort((a, b) => a.startH - b.startH).map(s => <button key={s.id} onClick={() => openEdit(s)} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#FFF', border: '1px solid #E2E8F0', borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: '10px 9px', marginBottom: 8, cursor: 'pointer' }}>
                <strong style={{ display: 'block', color: '#0F2347', fontSize: 12 }}>{s.name}</strong>
                <span style={{ display: 'block', color: '#475569', fontSize: 11, marginTop: 4 }}>{s.startH}h00 à {s.endH}h00</span>
                <span style={{ display: 'block', color: '#94A3B8', fontSize: 10, marginTop: 3 }}>{s.intervenant} · {s.room}</span>
              </button>)}
            </div>)}
          </div>
        </section>

        <aside className="op-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><div><h2 style={{ color: '#0F2347', fontSize: 16, fontWeight: 800 }}>Demandes de changement</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>Envoyées par les opérateurs</p></div>{pendingCount > 0 && <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 6, padding: '4px 7px', fontSize: 11, fontWeight: 800 }}>{pendingCount}</span>}</div>
          {requests.length === 0 && <div style={{ padding: '30px 12px', textAlign: 'center', background: '#F8FAFC', borderRadius: 8, color: '#64748B', fontSize: 12 }}>Aucune demande pour le moment.</div>}
          <div style={{ display: 'grid', gap: 10 }}>
            {requests.map(r => <article key={r.id} style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ color: '#0F2347', fontSize: 12 }}>{r.personnelName}</strong><span style={{ fontSize: 10, fontWeight: 700, color: r.status === 'En attente' ? '#92400E' : r.status === 'Approuvée' ? '#047857' : '#B91C1C' }}>{r.status}</span></div>
              <p style={{ color: '#475569', fontSize: 11, marginTop: 7, lineHeight: 1.5 }}><strong>{r.sessionName}</strong><br />{DAYS[r.currentDay].label} {r.currentStartH}h-{r.currentEndH}h vers <strong>{DAYS[r.requestedDay].label} {r.requestedStartH}h-{r.requestedEndH}h</strong></p>
              {r.reason && <p style={{ color: '#64748B', fontSize: 10, marginTop: 6 }}>Motif : {r.reason}</p>}
              {r.status === 'En attente' && <div style={{ display: 'flex', gap: 7, marginTop: 11 }}><button onClick={() => decide(r, false)} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Refuser</button><button onClick={() => decide(r, true)} className="btn-navy btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Approuver</button></div>}
            </article>)}
          </div>
        </aside>
      </div>

      {showForm && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(9,24,46,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="op-card" style={{ width: '100%', maxWidth: 520, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ color: '#0F2347', fontSize: 18, fontWeight: 800 }}>{editing ? 'Modifier la séance' : 'Ajouter une séance'}</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Fermer</button></div>
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Cours<input style={{ ...field, marginTop: 5 }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Salle<input style={{ ...field, marginTop: 5 }} value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} /></label><label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Intervenant<select style={{ ...field, marginTop: 5 }} value={form.intervenant} onChange={e => setForm({ ...form, intervenant: e.target.value })}><option>Karim Alaoui</option><option>Laila Bennouna</option><option>Omar El Fassi</option><option>Sanae Tahiri</option><option>Youssef Chraibi</option><option>Nadia Rami</option></select></label></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Jour<select style={{ ...field, marginTop: 5 }} value={form.day} onChange={e => setForm({ ...form, day: Number(e.target.value) })}>{DAYS.map((d, i) => <option key={d.label} value={i}>{d.label}</option>)}</select></label><label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Début<input type="number" min="8" max="19" style={{ ...field, marginTop: 5 }} value={form.startH} onChange={e => setForm({ ...form, startH: Number(e.target.value) })} /></label><label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Fin<input type="number" min="9" max="20" style={{ ...field, marginTop: 5 }} value={form.endH} onChange={e => setForm({ ...form, endH: Number(e.target.value) })} /></label></div>
          </div>
          <div style={{ display: 'flex', justifyContent: editing ? 'space-between' : 'flex-end', gap: 10, marginTop: 22 }}>{editing && <button onClick={removeSession} className="btn btn-sm" style={{ color: '#B91C1C', background: '#FEE2E2', border: 0 }}>Supprimer</button>}<div style={{ display: 'flex', gap: 10 }}><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annuler</button><button className="btn-gold" disabled={!form.name.trim() || form.endH <= form.startH} onClick={persistSession}>Enregistrer</button></div></div>
        </div>
      </div>}
    </div>
  )
}
