'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

type OnlineSession = {
  id: string; titre: string; starts_at: string; cohorte: string; formation: string
  online_status: 'active' | 'ended' | null; meeting_url: string | null; attendees: number
}

export default function OnlineSessionsPage() {
  const [sessions, setSessions] = useState<OnlineSession[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = () => api.get<OnlineSession[]>('/personnel/online-sessions').then(setSessions).catch(e => setError(e instanceof Error ? e.message : 'Impossible de charger les séances.'))
  useEffect(() => { load() }, [])

  async function start(session: OnlineSession) {
    setBusy(session.id); setError(''); setNotice('')
    try {
      const started = await api.post<{ meeting_url: string }>(`/personnel/online-sessions/${session.id}/start`, {})
      setNotice('Séance démarrée. Chaque étudiant qui rejoint est automatiquement marqué présent.')
      await load()
      window.open(started.meeting_url, '_blank', 'noopener,noreferrer')
    } catch (e) { setError(e instanceof Error ? e.message : 'Démarrage impossible.') }
    finally { setBusy(null) }
  }
  async function stop(id: string) {
    setBusy(id); setError(''); setNotice('')
    try { await api.post(`/personnel/online-sessions/${id}/stop`, {}); setNotice('Séance en ligne terminée.'); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Arrêt impossible.') }
    finally { setBusy(null) }
  }
  async function connectGoogle() {
    setError('')
    try {
      const result = await api.get<{ authorization_url: string }>('/personnel/resources/google/authorize')
      window.location.assign(result.authorization_url)
    } catch (e) { setError(e instanceof Error ? e.message : 'Connexion Google impossible.') }
  }

  return <div style={{ maxWidth: 1120 }}>
    <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}><div><p style={{ margin: 0, color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Espace enseignant</p><h1 style={{ margin: '6px 0', color: '#0F2347', fontSize: 27 }}>Séances en ligne</h1><p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Démarrez une séance depuis votre planning. L’entrée d’un étudiant enregistre automatiquement sa présence.</p></div><button onClick={connectGoogle} style={{ padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: 8, color: '#1B3A6B', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>Connecter / reconnecter Google</button></header>
    {error && <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
    {notice && <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#ECFDF5', color: '#166534', fontSize: 13, fontWeight: 600 }}>{notice}</div>}
    <section style={{ display: 'grid', gap: 14 }}>{sessions.map(session => {
      const active = session.online_status === 'active'
      return <article key={session.id} style={{ padding: 20, borderRadius: 14, background: '#fff', border: `1px solid ${active ? '#86EFAC' : '#E2E8F0'}` }}>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}><div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: active ? '#16A34A' : '#94A3B8' }} /><span style={{ color: active ? '#15803D' : '#64748B', fontSize: 11, fontWeight: 800 }}>{active ? 'EN DIRECT' : session.online_status === 'ended' ? 'TERMINÉE' : 'À DÉMARRER'}</span></div><h2 style={{ margin: 0, color: '#0F2347', fontSize: 17 }}>{session.titre}</h2><p style={{ color: '#64748B', margin: '6px 0 0', fontSize: 12 }}>{session.cohorte} · {session.formation} · {new Date(session.starts_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>{active && <div style={{ textAlign: 'right' }}><strong style={{ display: 'block', color: '#0F2347', fontSize: 22 }}>{session.attendees}</strong><small style={{ color: '#64748B' }}>présence(s) automatique(s)</small></div>}</div>
        {active ? <div style={{ display: 'flex', marginTop: 17, gap: 10, flexWrap: 'wrap' }}><a href={session.meeting_url ?? '#'} target="_blank" rel="noreferrer" className="btn-navy" style={{ textDecoration: 'none' }}>Ouvrir Google Meet</a><button onClick={() => stop(session.id)} disabled={busy === session.id} style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid #CBD5E1', color: '#475569', background: '#fff', fontWeight: 700 }}>{busy === session.id ? 'Traitement…' : 'Terminer la séance'}</button></div> : session.online_status !== 'ended' && <div style={{ display: 'flex', marginTop: 17, gap: 10, flexWrap: 'wrap' }}><button className="btn-navy" onClick={() => start(session)} disabled={busy === session.id}>{busy === session.id ? 'Création du Meet…' : 'Démarrer sur Google Meet'}</button></div>}
      </article>
    })}{!sessions.length && !error && <div style={{ padding: 32, color: '#64748B', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: 12 }}>Aucune séance planifiée à afficher.</div>}</section>
  </div>
}
