'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api-client'

type ApiSession = {
  id: string
  cohorte_id: string
  intervenant_id: string | null
  personnel_id: string | null
  titre: string
  description: string | null
  starts_at: string
  ends_at: string
  salle: string | null
  cohorte_nom?: string
  formation?: string
}

type Cohorte = { id: string; nom: string }

type ChangeRequest = {
  id: string
  session_name: string
  personnel_name: string
  current_starts_at: string
  current_ends_at: string
  starts_at_souhaite: string
  ends_at_souhaite: string
  motif: string | null
  statut: string
}

type SessionForm = {
  cohorteId: string
  title: string
  room: string
  day: number
  startH: number
  endH: number
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const field = { width: '100%', padding: '9px 11px', border: '1px solid #CBD5E1', borderRadius: 8, background: '#FFF' }
const initialForm: SessionForm = { cohorteId: '', title: '', room: '', day: 0, startH: 9, endH: 11 }

function dayIndex(dateValue: string) {
  return (new Date(dateValue).getDay() + 6) % 7
}

function mondayOfCurrentWeek() {
  const result = new Date()
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}

function dateAt(day: number, hour: number) {
  const date = mondayOfCurrentWeek()
  date.setDate(date.getDate() + day)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function requestStatus(value: string) {
  return value === 'approuvee' ? 'Approuvée' : value === 'refusee' ? 'Refusée' : 'En attente'
}

export default function DirectorPlanningPage() {
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [cohortes, setCohortes] = useState<Cohorte[]>([])
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ApiSession | null>(null)
  const [form, setForm] = useState<SessionForm>(initialForm)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [sessionItems, cohortItems, requestItems] = await Promise.all([
        api.get<ApiSession[]>('/director/planning'),
        api.get<Cohorte[]>('/director/cohortes'),
        api.get<ChangeRequest[]>('/director/planning/requests'),
      ])
      setSessions(sessionItems)
      setCohortes(cohortItems)
      setRequests(requestItems)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const dates = useMemo(() => DAYS.map((label, index) => {
    const date = mondayOfCurrentWeek()
    date.setDate(date.getDate() + index)
    return { label, date: date.getDate() }
  }), [])

  function openCreate() {
    setEditing(null)
    setForm({ ...initialForm, cohorteId: cohortes[0]?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(session: ApiSession) {
    const start = new Date(session.starts_at)
    const end = new Date(session.ends_at)
    setEditing(session)
    setForm({
      cohorteId: session.cohorte_id,
      title: session.titre,
      room: session.salle ?? '',
      day: dayIndex(session.starts_at),
      startH: start.getHours(),
      endH: end.getHours(),
    })
    setShowForm(true)
  }

  async function persistSession() {
    if (!form.title.trim() || !form.cohorteId || form.endH <= form.startH) return
    const payload = {
      cohorte_id: form.cohorteId,
      intervenant_id: editing?.intervenant_id ?? null,
      personnel_id: editing?.personnel_id ?? null,
      titre: form.title.trim(),
      description: editing?.description ?? null,
      starts_at: dateAt(form.day, form.startH),
      ends_at: dateAt(form.day, form.endH),
      salle: form.room || null,
    }
    setError('')
    try {
      if (editing) await api.patch(`/director/planning/${editing.id}`, payload)
      else await api.post('/director/planning', payload)
      setShowForm(false)
      setNotice(editing ? 'Séance mise à jour dans le backend.' : 'Séance ajoutée dans le backend.')
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enregistrement impossible.')
    }
  }

  async function removeSession() {
    if (!editing) return
    try {
      await api.delete(`/director/planning/${editing.id}`)
      setShowForm(false)
      setNotice('Séance supprimée du backend.')
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Suppression impossible.')
    }
  }

  async function decide(request: ChangeRequest, approved: boolean) {
    try {
      await api.patch(`/director/planning/requests/${request.id}`, { statut: approved ? 'approuvee' : 'refusee' })
      setNotice(approved ? 'Demande approuvée et séance reportée.' : 'Demande refusée.')
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Décision impossible.')
    }
  }

  return (
    <div>
      {notice && <div className="card card-p" role="status" style={{ color: '#047857', marginBottom: 14 }}>{notice}</div>}
      {error && <div className="card card-p" role="alert" style={{ color: '#B91C1C', marginBottom: 14 }}>{error}</div>}
      <header className="page-header">
        <div className="page-header-left"><div className="page-breadcrumb"><span>Directeur</span><span className="page-breadcrumb-sep">›</span><span>Planning</span></div><h1 className="page-title">Planning des séances</h1><p className="page-subtitle">Séances et demandes synchronisées avec FastAPI.</p></div>
        <button className="btn btn-primary btn-sm" onClick={openCreate} disabled={!cohortes.length}>Ajouter une séance</button>
      </header>

      {loading ? <div className="card card-p" style={{ textAlign: 'center' }}>Chargement depuis FastAPI…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, .75fr)', gap: 18, alignItems: 'start' }}>
          <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(95px, 1fr))', background: '#F8FAFC' }}>
              {dates.map(day => <div key={day.label} style={{ padding: 13, textAlign: 'center', borderRight: '1px solid #E2E8F0' }}><strong>{day.label}</strong><div>{day.date}</div></div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(95px, 1fr))', minHeight: 470 }}>
              {dates.map((day, index) => <div key={day.label} style={{ padding: 8, borderRight: '1px solid #EEF2F7' }}>
                {sessions.filter(session => dayIndex(session.starts_at) === index).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map(session => (
                  <button key={session.id} onClick={() => openEdit(session)} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#FFF', border: '1px solid #E2E8F0', borderLeft: '4px solid #1B3A6B', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    <strong style={{ display: 'block' }}>{session.titre}</strong>
                    <span style={{ display: 'block', marginTop: 4 }}>{new Date(session.starts_at).getHours()}h–{new Date(session.ends_at).getHours()}h</span>
                    <small>{session.cohorte_nom} · {session.salle || 'Sans salle'}</small>
                  </button>
                ))}
              </div>)}
            </div>
          </section>

          <aside className="card card-p">
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Demandes de changement</h2>
            {!requests.length && <div style={{ color: '#64748B' }}>Aucune demande.</div>}
            <div style={{ display: 'grid', gap: 10 }}>
              {requests.map(request => (
                <article key={request.id} style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: 13 }}>
                  <div className="row-between"><strong>{request.personnel_name}</strong><span className="badge badge-navy">{requestStatus(request.statut)}</span></div>
                  <p style={{ marginTop: 8, fontSize: 12 }}>{request.session_name}<br />Nouvel horaire : {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(request.starts_at_souhaite))}</p>
                  {request.motif && <p className="card-meta" style={{ marginTop: 6 }}>Motif : {request.motif}</p>}
                  {request.statut === 'en_attente' && <div className="row" style={{ marginTop: 10 }}><button className="btn btn-ghost btn-sm" onClick={() => void decide(request, false)}>Refuser</button><button className="btn btn-primary btn-sm" onClick={() => void decide(request, true)}>Approuver</button></div>}
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}

      {showForm && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(9,24,46,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card card-p" style={{ width: '100%', maxWidth: 520 }}>
          <div className="row-between"><h2>{editing ? 'Modifier la séance' : 'Ajouter une séance'}</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Fermer</button></div>
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            <label>Cohorte<select style={{ ...field, marginTop: 5 }} value={form.cohorteId} onChange={event => setForm({ ...form, cohorteId: event.target.value })}>{cohortes.map(cohorte => <option key={cohorte.id} value={cohorte.id}>{cohorte.nom}</option>)}</select></label>
            <label>Cours<input style={{ ...field, marginTop: 5 }} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label>
            <label>Salle<input style={{ ...field, marginTop: 5 }} value={form.room} onChange={event => setForm({ ...form, room: event.target.value })}/></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <label>Jour<select style={{ ...field, marginTop: 5 }} value={form.day} onChange={event => setForm({ ...form, day: Number(event.target.value) })}>{DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
              <label>Début<input type="number" min={6} max={22} style={{ ...field, marginTop: 5 }} value={form.startH} onChange={event => setForm({ ...form, startH: Number(event.target.value) })}/></label>
              <label>Fin<input type="number" min={7} max={23} style={{ ...field, marginTop: 5 }} value={form.endH} onChange={event => setForm({ ...form, endH: Number(event.target.value) })}/></label>
            </div>
          </div>
          <div className="row-between" style={{ marginTop: 20 }}>
            {editing ? <button className="btn btn-sm" style={{ color: '#B91C1C' }} onClick={() => void removeSession()}>Supprimer</button> : <span/>}
            <div className="row"><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={() => void persistSession()}>Enregistrer</button></div>
          </div>
        </div>
      </div>}
    </div>
  )
}
