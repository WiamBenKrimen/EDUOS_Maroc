'use client'

import { useEffect, useMemo, useState } from 'react'
import { CaretLeft, CaretRight, MagnifyingGlass } from '@phosphor-icons/react'
import { api } from '@/lib/api-client'
import type { TeachingSession } from '@/lib/teaching-types'

const weekDays = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']

function inputDate(value: string): string {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function startOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function dateKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function monthDays(value: Date): Date[] {
  const first = startOfMonth(value)
  const mondayOffset = (first.getDay() + 6) % 7
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })
}

function monthLabel(value: Date): string {
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(value)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function sessionTime(value: string): string {
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function PlanningView() {
  const [sessions, setSessions] = useState<TeachingSession[]>([])
  const [selected, setSelected] = useState<TeachingSession | null>(null)
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()))
  const [form, setForm] = useState({ starts_at: '', ends_at: '', motif: '' })
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = () => api.get<TeachingSession[]>('/personnel/planning').then(setSessions).catch(error => {
    setError(error instanceof Error ? error.message : 'Impossible de charger le planning.')
  })

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => sessions.filter(session =>
    [session.titre, session.cohorte, session.formation, session.salle].some(value => String(value ?? '').toLowerCase().includes(search.toLowerCase())),
  ), [sessions, search])

  const eventsByDay = useMemo(() => {
    const result = new Map<string, TeachingSession[]>()
    for (const session of filtered) {
      const key = dateKey(new Date(session.starts_at))
      result.set(key, [...(result.get(key) ?? []), session])
    }
    return result
  }, [filtered])

  const calendarDays = useMemo(() => monthDays(viewDate), [viewDate])
  const today = dateKey(new Date())
  const visibleCount = filtered.filter(session => {
    const start = new Date(session.starts_at)
    return start.getFullYear() === viewDate.getFullYear() && start.getMonth() === viewDate.getMonth()
  }).length

  function changeMonth(offset: number) {
    setViewDate(current => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  function openRequest(session: TeachingSession) {
    if (session.request_statut === 'en_attente') return
    setSelected(session)
    setForm({ starts_at: inputDate(session.starts_at), ends_at: inputDate(session.ends_at), motif: '' })
  }

  async function submitRequest() {
    if (!selected) return
    setError('')
    try {
      await api.post(`/personnel/planning/${selected.id}/change-requests`, {
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        motif: form.motif || null,
      })
      setSelected(null)
      setNotice('Votre demande a été enregistrée et envoyée au directeur.')
      await load()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible d’envoyer la demande.')
    }
  }

  return <div className="teaching-planning-page">
    <div className="op-page-header">
      <div><div className="op-breadcrumb"><span>Personnel</span><span className="op-breadcrumb-sep">›</span><span className="op-breadcrumb-active">Planning</span></div><h1 className="op-page-title">Mon emploi du temps</h1><p className="op-page-subtitle">Calendrier mensuel des séances affectées par la direction.</p></div>
    </div>
    {error && <div className="auth-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}
    {notice && <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#ECFDF5', color: '#047857' }}>{notice}</div>}
    <div className="op-card teaching-calendar-tools">
      <label className="teaching-calendar-search"><MagnifyingGlass size={18} /><span className="sr-only">Rechercher dans le planning</span><input className="search-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une séance ou une cohorte..." /></label>
      <div className="teaching-calendar-nav" aria-label="Navigation du calendrier">
        <button className="btn btn-outline btn-sm" onClick={() => changeMonth(-1)} aria-label="Mois précédent"><CaretLeft size={17} /></button>
        <button className="btn btn-outline btn-sm teaching-calendar-today" onClick={() => setViewDate(startOfMonth(new Date()))}>Aujourd’hui</button>
        <button className="btn btn-outline btn-sm" onClick={() => changeMonth(1)} aria-label="Mois suivant"><CaretRight size={17} /></button>
      </div>
    </div>
    <section className="op-card teaching-calendar-card">
      <header className="teaching-calendar-header">
        <div><h2>{monthLabel(viewDate)}</h2><p>{visibleCount} séance{visibleCount > 1 ? 's' : ''} ce mois-ci</p></div>
        <div className="teaching-calendar-legend"><span><i className="planned" />Planifiée</span><span><i className="finished" />Terminée</span><span><i className="changed" />Demande en attente</span></div>
      </header>
      <div className="teaching-calendar-scroll">
        <div className="teaching-calendar-grid teaching-calendar-weekdays">
          {weekDays.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="teaching-calendar-grid teaching-calendar-days">
          {calendarDays.map(day => {
            const key = dateKey(day)
            const daySessions = eventsByDay.get(key) ?? []
            const outside = day.getMonth() !== viewDate.getMonth()
            return <div className={`teaching-calendar-day${outside ? ' is-outside' : ''}${key === today ? ' is-today' : ''}`} key={key}>
              <span className="teaching-calendar-date">{day.getDate()}</span>
              <div className="teaching-calendar-events">
                {daySessions.map(session => <button
                  key={session.id}
                  className={`teaching-calendar-event ${session.statut === 'terminee' ? 'is-finished' : ''} ${session.request_statut === 'en_attente' ? 'has-request' : ''}`}
                  onClick={() => openRequest(session)}
                  title={session.request_statut === 'en_attente' ? 'Demande de changement en attente' : 'Demander un changement'}
                >
                  <span>{sessionTime(session.starts_at)} - {sessionTime(session.ends_at)}</span>
                  <strong>{session.titre}</strong>
                  <small>{session.cohorte}{session.salle ? `, ${session.salle}` : ''}</small>
                </button>)}
              </div>
            </div>
          })}
        </div>
      </div>
    </section>
    {selected && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(9,24,46,.5)' }}>
      <section className="op-card" style={{ width: '100%', maxWidth: 520, padding: 24 }}>
        <div className="row-between"><div><h2 style={{ color: '#0F2347' }}>Demander un changement</h2><p style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>{selected.titre}, {selected.cohorte}</p></div><button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Fermer</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}><label style={{ fontSize: 12, color: '#475569' }}>Nouveau début<input type="datetime-local" value={form.starts_at} onChange={event => setForm(current => ({ ...current, starts_at: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label><label style={{ fontSize: 12, color: '#475569' }}>Nouvelle fin<input type="datetime-local" value={form.ends_at} onChange={event => setForm(current => ({ ...current, ends_at: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label></div>
        <label style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#475569' }}>Motif<textarea value={form.motif} onChange={event => setForm(current => ({ ...current, motif: event.target.value }))} rows={4} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8, resize: 'vertical' }} /></label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}><button className="btn btn-ghost" onClick={() => setSelected(null)}>Annuler</button><button className="btn-navy" onClick={submitRequest} disabled={!form.starts_at || !form.ends_at || new Date(form.ends_at) <= new Date(form.starts_at)}>Envoyer au directeur</button></div>
      </section>
    </div>}
  </div>
}
