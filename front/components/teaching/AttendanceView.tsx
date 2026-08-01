'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api-client'
import { formatDateTime, type TeachingSession } from '@/lib/teaching-types'

type AttendanceStatus = 'present' | 'absent' | 'retard' | 'excuse'
type Participant = {
  participant_id: string
  inscription_id: string
  matricule: string
  nom: string
  statut: AttendanceStatus | null
  justification: string | null
  validated_at: string | null
}
type Sheet = { session: TeachingSession; participants: Participant[] }

const statusLabels: Record<AttendanceStatus, string> = { present: 'Présent', retard: 'Retard', absent: 'Absent', excuse: 'Excusé' }

export default function AttendanceView() {
  const [sessions, setSessions] = useState<TeachingSession[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.get<TeachingSession[]>('/personnel/attendance/sessions').then(items => {
      setSessions(items)
      setSelectedId(items[0]?.id ?? '')
    }).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger les séances.'))
  }, [])

  useEffect(() => {
    if (!selectedId) { setSheet(null); return }
    api.get<Sheet>(`/personnel/attendance/${selectedId}`).then(setSheet).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger la feuille.'))
  }, [selectedId])

  const counts = useMemo(() => ({
    present: sheet?.participants.filter(item => item.statut === 'present').length ?? 0,
    retard: sheet?.participants.filter(item => item.statut === 'retard').length ?? 0,
    absent: sheet?.participants.filter(item => item.statut === 'absent').length ?? 0,
    pending: sheet?.participants.filter(item => !item.statut).length ?? 0,
  }), [sheet])

  function updateStatus(participantId: string, statut: AttendanceStatus) {
    setSheet(current => current ? { ...current, participants: current.participants.map(item => item.participant_id === participantId ? { ...item, statut } : item) } : current)
  }

  async function save() {
    if (!sheet) return
    const entries = sheet.participants.filter(item => item.statut).map(item => ({ participant_id: item.participant_id, statut: item.statut, justification: item.justification }))
    if (!entries.length) { setError('Saisissez au moins une présence.'); return }
    setError('')
    try {
      const result = await api.put<{ updated: number }>(`/personnel/attendance/${sheet.session.id}`, { entries })
      setNotice(`${result.updated} présence(s) enregistrée(s) dans PostgreSQL.`)
      const refreshed = await api.get<Sheet>(`/personnel/attendance/${sheet.session.id}`)
      setSheet(refreshed)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible d’enregistrer les présences.')
    }
  }

  return <div>
    <div className="op-page-header"><div><div className="op-breadcrumb"><span>Personnel</span><span className="op-breadcrumb-sep">›</span><span className="op-breadcrumb-active">Présences</span></div><h1 className="op-page-title">Feuille de présence</h1><p className="op-page-subtitle">Les modifications sont enregistrées sur la séance sélectionnée.</p></div><button className="btn-navy" onClick={save} disabled={!sheet}>Enregistrer les présences</button></div>
    {error && <div className="auth-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}
    {notice && <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#ECFDF5', color: '#047857' }}>{notice}</div>}
    <div className="op-card" style={{ padding: 16, marginBottom: 18 }}>
      <label style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Séance<select value={selectedId} onChange={event => setSelectedId(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff' }}><option value="">Aucune séance affectée</option>{sessions.map(session => <option key={session.id} value={session.id}>{session.cohorte} — {session.titre} — {formatDateTime(session.starts_at)}</option>)}</select></label>
    </div>
    {sheet && <>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>{[['Présents', counts.present], ['Retards', counts.retard], ['Absents', counts.absent], ['Non saisis', counts.pending]].map(([label, value]) => <article key={String(label)} className="op-card" style={{ padding: 16 }}><span style={{ color: '#64748B', fontSize: 12 }}>{label}</span><strong style={{ display: 'block', color: '#0F2347', fontSize: 22, marginTop: 5 }}>{value}</strong></article>)}</section>
      <section className="op-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #F1F5F9' }}><strong style={{ color: '#0F2347' }}>{sheet.session.cohorte}</strong><small style={{ display: 'block', color: '#64748B', marginTop: 3 }}>{sheet.session.titre} · {formatDateTime(sheet.session.starts_at)}</small></div>
        {sheet.participants.length === 0 && <p style={{ padding: 24, color: '#64748B' }}>Aucun participant inscrit dans cette cohorte.</p>}
        {sheet.participants.map((participant, index) => <div key={participant.participant_id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 14, alignItems: 'center', padding: 14, borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ color: '#94A3B8' }}>{index + 1}</span><div><strong style={{ color: '#0F2347', fontSize: 13 }}>{participant.nom}</strong><small style={{ display: 'block', color: '#64748B' }}>{participant.matricule}</small></div>
          <div style={{ display: 'flex', gap: 7 }}>{(Object.keys(statusLabels) as AttendanceStatus[]).map(status => <button key={status} onClick={() => updateStatus(participant.participant_id, status)} className="btn btn-sm" style={{ border: `1px solid ${participant.statut === status ? '#1B3A6B' : '#CBD5E1'}`, background: participant.statut === status ? '#1B3A6B' : '#fff', color: participant.statut === status ? '#fff' : '#475569' }}>{statusLabels[status]}</button>)}</div>
        </div>)}
      </section>
    </>}
  </div>
}
