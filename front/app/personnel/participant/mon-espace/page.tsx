'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import type { ParticipantDashboard, ParticipantNotification, ParticipantSession } from '@/lib/participant-types'
import ParticipantOverview from '../participant-overview'

type Detail = {
  eyebrow: string
  title: string
  description: string
  icon: 'calendar' | 'chart' | 'bell' | 'document'
  facts: { label: string; value: string }[]
  action?: { label: string; href: string }
}

type PaymentSummary = {
  items: Array<{ montant_ttc: number; montant_paye: number; statut: string }>
}

const ICONS = {
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="m9 16 2 2 4-5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M14 21h-4"/></>,
  document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
}

function DetailPage({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose])

  return <section className="part-detail-page" aria-label={detail.title}>
    <div className="part-detail-toolbar"><button className="part-back-button" onClick={onClose}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Retour à mon espace</button><span>Informations synchronisées avec votre centre</span></div>
    <div className="part-detail-hero"><div className="part-detail-head"><div className="part-detail-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ICONS[detail.icon]}</svg></div><div><span className="part-detail-eyebrow">{detail.eyebrow}</span><h1>{detail.title}</h1><p>{detail.description}</p></div><span className="part-detail-status"><i /> Information à jour</span></div></div>
    <div className="part-detail-layout">
      <article className="part-detail-main-card"><div className="part-detail-card-title"><div><span>Détails</span><h2>Informations principales</h2></div><span className="part-detail-card-icon">i</span></div><div className="part-detail-facts">{detail.facts.map(fact => <div className="part-detail-fact" key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}</div></article>
      <aside className="part-detail-side-card"><span className="part-section-kicker">Actions rapides</span><h2>Que souhaitez-vous faire ?</h2>{detail.action && <Link href={detail.action.href} className="part-detail-action">{detail.action.label}<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></Link>}<div className="part-detail-help"><span className="part-help-icon">?</span><div><strong>Besoin d’aide ?</strong><small>Contactez l’administration depuis votre espace participant.</small></div></div></aside>
    </div>
  </section>
}

function formatSessionDate(session: ParticipantSession) {
  return new Date(session.starts_at).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
}

export default function MonEspacePage() {
  const [data, setData] = useState<ParticipantDashboard | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [dueAmount, setDueAmount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<ParticipantDashboard>('/participant/dashboard'),
      api.get<PaymentSummary>('/participant/payments'),
    ]).then(([dashboard, payments]) => {
      setData(dashboard)
      setDueAmount(payments.items.reduce((sum, invoice) => sum + (['payee', 'annulee'].includes(invoice.statut) ? 0 : Math.max(0, Number(invoice.montant_ttc) - Number(invoice.montant_paye))), 0))
    }).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger votre espace.'))
  }, [])

  const showCourse = (requested?: ParticipantSession) => {
    const session = requested ?? data?.sessions[0]
    if (!session) return
    setDetail({
      eyebrow: 'Séance',
      title: session.titre,
      description: session.description || `Séance de ${session.formation} avec votre cohorte.`,
      icon: 'calendar',
      facts: [
        { label: 'Date et horaire', value: formatSessionDate(session) },
        { label: 'Fin', value: new Date(session.ends_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
        { label: 'Salle', value: session.salle || 'À confirmer' },
        { label: 'Formateur', value: session.formateur || data?.profile.formateur || 'Non affecté' },
        { label: 'Statut', value: session.presence_statut || session.statut },
      ],
      action: { label: 'Ouvrir les ressources du cours', href: '/personnel/participant/ressources' },
    })
  }

  const showProgress = () => {
    const report = data?.latest_report
    setDetail({
      eyebrow: 'Votre parcours',
      title: data?.profile.formation ? `Progression ${data.profile.formation}` : 'Ma progression',
      description: report?.appreciation || 'Votre progression est calculée à partir des ressources, présences et rapports publiés.',
      icon: 'chart',
      facts: [
        { label: 'Programme complété', value: `${data?.stats.progression_ressources ?? 0}%` },
        { label: 'Taux de présence', value: `${data?.stats.taux_presence ?? 0}%` },
        { label: 'Dernier score', value: report ? `${report.score_global}/100` : 'Aucun rapport' },
        { label: 'Cohorte', value: data?.profile.cohorte || 'Non affectée' },
      ],
      action: { label: 'Voir mes rapports détaillés', href: '/personnel/participant/rapports' },
    })
  }

  const openNotification = async (notification: ParticipantNotification) => {
    if (!notification.read_at) {
      await api.patch(`/participant/notifications/${notification.id}/read`, {})
      setData(current => current ? { ...current, notifications: current.notifications.map(item => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item) } : current)
    }
    const href = notification.action_url?.replace(/^\/participant/, '/personnel/participant')
    setDetail({
      eyebrow: 'Notification',
      title: notification.titre,
      description: notification.message,
      icon: 'bell',
      facts: [
        { label: 'Reçue', value: new Date(notification.created_at).toLocaleString('fr-FR') },
        { label: 'Statut', value: 'Lue' },
        { label: 'Formation', value: data?.profile.formation || 'Votre formation' },
      ],
      action: href ? { label: 'Consulter la rubrique', href } : undefined,
    })
  }

  return <div className="part-dashboard">
    {error && <div className="auth-error" role="alert">{error}</div>}
    {detail && <DetailPage detail={detail} onClose={() => setDetail(null)} />}
    {!detail && data && <ParticipantOverview data={data} notices={data.notifications} dueAmount={dueAmount} onCourse={showCourse} onProgress={showProgress} onNotice={notification => void openNotification(notification)} />}
  </div>
}
