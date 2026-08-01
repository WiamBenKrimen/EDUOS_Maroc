'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { ParticipantDashboard, ParticipantNotification, ParticipantSession } from '@/lib/participant-types'

type Props = {
  data: ParticipantDashboard
  notices: ParticipantNotification[]
  dueAmount: number
  onCourse: (session?: ParticipantSession) => void
  onProgress: () => void
  onNotice: (notice: ParticipantNotification) => void
}

function relativeDate(value: string) {
  const timestamp = new Date(value).getTime()
  const hours = Math.max(0, Math.round((Date.now() - timestamp) / 3_600_000))
  if (hours < 1) return 'À l’instant'
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.round(hours / 24)
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`
}

function sessionAttendance(session: ParticipantSession) {
  if (session.presence_statut === 'present') return 100
  if (session.presence_statut === 'retard') return 75
  if (session.presence_statut === 'absent') return 15
  return 40
}

export default function ParticipantOverview({ data, notices, dueAmount, onCourse, onProgress, onNotice }: Props) {
  const { profile, stats } = data
  const sessions = data.sessions.slice(0, 3)
  const chartSessions = data.sessions.slice(0, 12).reverse()
  const bars = Array.from({ length: 12 }, (_, index) => ({
    label: `S${index + 1}`,
    value: chartSessions[index] ? sessionAttendance(chartSessions[index]) : 0,
  }))
  const attendance = Math.max(0, Math.min(100, stats.taux_presence))
  const progression = Math.max(0, Math.min(100, stats.progression_ressources))
  const nextSession = sessions[0]

  return <div className="overview-pro">
    <nav className="overview-tabs">
      <button className="active">Vue d’ensemble</button><button onClick={() => onCourse()}>Mon agenda</button><button onClick={onProgress}>Ma progression</button><Link href="/personnel/participant/documents">Documents</Link><Link href="/personnel/participant/notifications">Activité</Link>
    </nav>

    <header className="overview-welcome">
      <div>
        <h1><span>Bonjour,</span> {profile.prenom}</h1>
        <p>Votre formation <strong>{profile.formation ?? 'en cours'}</strong> <span aria-hidden="true">·</span> {profile.cohorte ?? 'Votre groupe'}</p>
      </div>
      <span className="overview-status"><i/> Formation en cours</span>
    </header>

    <section className="overview-analytics">
      <div className="overview-rings">
        <button onClick={onProgress}><span className="overview-ring blue" style={{ '--value': `${attendance}%` } as CSSProperties}><i><strong>{attendance}%</strong><small>Présence</small></i></span></button>
        <button onClick={onProgress}><span className="overview-ring gold" style={{ '--value': `${progression}%` } as CSSProperties}><i><strong>{progression}%</strong><small>Programme</small></i></span></button>
        <Link href="/personnel/participant/paiement"><span className="overview-ring green" style={{ '--value': stats.paiements_en_attente ? '45%' : '100%' } as CSSProperties}><i><strong>{dueAmount}</strong><small>DH à venir</small></i></span></Link>
      </div>
      <div className="overview-chart">
        <div className="overview-chart-head"><div><span>ASSIDUITÉ · 12 DERNIÈRES SÉANCES</span><h2>Régularité de votre présence</h2><p>Chaque barre représente une séance récente.</p></div><strong>{attendance}% <small>taux global</small></strong></div>
        <div className="overview-bars">{bars.map(bar => <span key={bar.label} title={`${bar.label} : ${bar.value}%`}><em>{bar.value}%</em><i className={bar.value >= 80 ? 'on-target' : ''} style={{ height: `${bar.value}%` }}/><small>{bar.label}</small></span>)}</div>
      </div>
    </section>

    <section className="overview-main">
      <div className="overview-agenda">
        <div className="overview-section-title"><div><span>AGENDA</span><h2>Prochaines séances</h2></div><button onClick={() => onCourse()}>Voir le programme →</button></div>
        {nextSession ? <>
          <button className="overview-next" onClick={() => onCourse(nextSession)}>
            <time><strong>{new Date(nextSession.starts_at).getDate()}</strong><small>{new Date(nextSession.starts_at).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}</small></time><span><small>{new Date(nextSession.starts_at).toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()} · {new Date(nextSession.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small><strong>{nextSession.titre}</strong><em>{nextSession.salle || 'Salle à confirmer'} · {nextSession.formateur || profile.formateur || 'Formateur'}</em></span><i>→</i>
          </button>
          {sessions.slice(1).map(session => <button className="overview-agenda-row" key={session.id} onClick={() => onCourse(session)}><time>{new Date(session.starts_at).getDate()} {new Date(session.starts_at).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}</time><strong>{session.titre}</strong><span>{new Date(session.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(session.ends_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span><i>›</i></button>)}
        </> : <p>Aucune séance planifiée.</p>}
      </div>

      <aside className="overview-activity">
        <div className="overview-section-title"><div><span>ACTIVITÉ</span><h2>À ne pas manquer</h2></div><Link href="/personnel/participant/notifications">Tout voir</Link></div>
        {notices.slice(0, 3).map((notice, index) => <button key={notice.id} onClick={() => onNotice(notice)}><i className={`notice-dot n${index}`}/><span><small>{relativeDate(notice.created_at)}</small><strong>{notice.titre}</strong><p>{notice.message}</p></span><em>›</em></button>)}
      </aside>
    </section>

    <footer className="overview-footer">
      <div className="overview-footer-title"><span>ACCÈS RAPIDES</span><h2>Que souhaitez-vous faire ?</h2></div>
      <div className="overview-footer-links">
        <Link href="/personnel/participant/ressources"><span className="quick-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 6.5v13"/></svg></span><span><strong>Continuer le cours</strong><small>Reprendre vos ressources</small></span><i>→</i></Link>
        <Link href="/personnel/participant/paiement"><span className="quick-icon gold"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/></svg></span><span><strong>Gérer mes paiements</strong><small>Échéances, historique et reçus</small></span><i>→</i></Link>
        <Link href="/personnel/participant/documents"><span className="quick-icon green"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6v20h12V6z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg></span><span><strong>Mes documents</strong><small>Consulter et télécharger</small></span><i>→</i></Link>
      </div>
    </footer>
  </div>
}
