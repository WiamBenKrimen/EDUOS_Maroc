'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api-client'

const STATIC_KPIS = [
  { label: 'Élèves actifs', value: '—', trend: 'Chargement…', icon: 'students' },
  { label: 'Taux de présence', value: '—', trend: 'Chargement…', icon: 'attendance' },
  { label: 'CA encaissé', value: '—', trend: 'Mois en cours', icon: 'revenue' },
  { label: 'Paiements en retard', value: '—', trend: 'Chargement…', icon: 'warning', alert: true },
]

const recommendations = [
  { title: 'Valider les rémunérations des formateurs', detail: '4 dossiers prêts pour validation · 12 440 DH', tag: 'Finance', href: '/directeur/formateurs' },
  { title: 'Relancer les apprenants en retard', detail: '23 paiements nécessitent une action cette semaine', tag: 'Prioritaire', href: '/directeur/paiements' },
  { title: 'Préparer les renouvellements', detail: '5 contrats arrivent à échéance dans moins de 7 jours', tag: 'Planification', href: '/directeur/renouvellements' },
]

const months = [['Fév', 48], ['Mar', 62], ['Avr', 55], ['Mai', 75], ['Juin', 67], ['Juil', 88]] as const

type UpcomingSession = {
  id: string
  titre: string
  starts_at: string
  cohorte: string
  intervenant: string | null
}

function DashboardIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    students: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-6A3.5 3.5 0 0 0 3 18.5V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8M21 20v-1.5a3.5 3.5 0 0 0-2.6-3.4"/></>,
    attendance: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/></>,
    revenue: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M16 14h2"/></>,
    warning: <><path d="M10.3 4.1 2.6 17.4A1.7 1.7 0 0 0 4.1 20h15.8a1.7 1.7 0 0 0 1.5-2.6L13.7 4.1a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 16.5h.01"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

export default function DirecteurDashboard() {
  const [kpis, setKpis] = useState(STATIC_KPIS)
  const [sessions, setSessions] = useState<UpcomingSession[]>([])
  const [dashboardError, setDashboardError] = useState('')
  const [toast, setToast] = useState('')
  const [hiddenRecommendations, setHiddenRecommendations] = useState<string[]>([])
  const [actions, setActions] = useState(recommendations)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionTitle, setActionTitle] = useState('')
  const [actionCategory, setActionCategory] = useState('Cohortes')
  const [actionPriority, setActionPriority] = useState('Normale')
  const [actionDueDate, setActionDueDate] = useState('')

  useEffect(() => {
    api.get<{ eleves_actifs: number; taux_presence: number; ca_encaisse: number; paiements_retard: number; upcoming_sessions: UpcomingSession[] }>('/director/dashboard')
      .then(data => {
        setKpis([
          { label: 'Élèves actifs', value: String(data.eleves_actifs), trend: 'Total confirmés', icon: 'students' },
          { label: 'Taux de présence', value: `${data.taux_presence} %`, trend: 'Toutes séances', icon: 'attendance' },
          { label: 'CA encaissé', value: `${Number(data.ca_encaisse).toLocaleString('fr-FR')} DH`, trend: 'Mois en cours', icon: 'revenue' },
          { label: 'Paiements en retard', value: String(data.paiements_retard), trend: 'Factures échuées', icon: 'warning', alert: data.paiements_retard > 0 },
        ])
        setSessions(data.upcoming_sessions ?? [])
      })
      .catch(error => setDashboardError(error instanceof Error ? error.message : 'Tableau de bord indisponible.'))
  }, [])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const visibleRecommendations = actions.filter(item => !hiddenRecommendations.includes(item.title))

  function createAction(event: React.FormEvent) {
    event.preventDefault()
    const routes: Record<string, string> = {
      Cohortes: '/directeur/cohortes',
      Paiements: '/directeur/paiements',
      Formateurs: '/directeur/formateurs',
      Renouvellements: '/directeur/renouvellements',
    }
    const dueLabel = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${actionDueDate}T12:00:00`))
    setActions(current => [{
      title: actionTitle,
      detail: `Échéance le ${dueLabel} · Priorité ${actionPriority.toLowerCase()}`,
      tag: actionCategory,
      href: routes[actionCategory],
    }, ...current])
    setShowActionModal(false)
    setActionTitle('')
    setActionDueDate('')
    setActionPriority('Normale')
    notify(`Action « ${actionTitle} » ajoutée au tableau de bord.`)
  }

  function exportReport() {
    const content = [
      'EDUOS MAROC · RAPPORT DE DIRECTION',
      'Centre Rabat Hassan',
      '',
      'Élèves actifs : 347',
      'Taux de présence : 87 %',
      'CA encaissé : 84 200 DH',
      'Paiements en retard : 23',
      '',
      `Actions ouvertes : ${visibleRecommendations.length}`,
    ].join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'rapport-direction-eduos.txt'
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Rapport exporté.')
  }

  return (
    <div className="director-v2">
      {toast && <div className="director-v2-toast" role="status">{toast}</div>}
      {dashboardError && <div className="card card-p" role="alert" style={{ color: '#B91C1C', marginBottom: 16 }}>{dashboardError}</div>}

      <header className="director-v2-heading">
        <div>
          <span>Centre EDUOS · Rabat Hassan</span>
          <h1>Vue d’ensemble</h1>
          <p>Suivez la performance du centre et traitez les actions importantes.</p>
        </div>
        <div>
          <button onClick={exportReport}>Exporter</button>
          <button className="primary" onClick={() => setShowActionModal(true)}>Nouvelle action</button>
        </div>
      </header>

      <section className="director-v2-kpis" aria-label="Indicateurs clés">
        {kpis.map(kpi => (
          <article key={kpi.label}>
            <div className={`director-v2-icon${kpi.alert ? ' alert' : ''}`}><DashboardIcon name={kpi.icon}/></div>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small className={kpi.alert ? 'alert' : ''}>{kpi.trend}</small>
          </article>
        ))}
      </section>

      <section className="director-v2-recommendations">
        <header>
          <div>
            <span className="director-v2-spark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></svg>
            </span>
            <div><h2>Actions recommandées</h2><p>Priorités calculées selon les échéances et les données du centre.</p></div>
          </div>
          <button onClick={() => {
            setHiddenRecommendations(actions.map(item => item.title))
            notify('Toutes les actions ont été marquées comme traitées.')
          }}>Traiter tout</button>
        </header>
        <div className="director-v2-rec-list">
          {visibleRecommendations.length ? visibleRecommendations.map(item => (
            <article key={item.title}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <span>{item.tag}</span>
              </div>
              <Link href={item.href}>Ouvrir</Link>
              <button aria-label={`Masquer ${item.title}`} onClick={() => setHiddenRecommendations(current => [...current, item.title])}>×</button>
            </article>
          )) : <div className="director-v2-empty"><strong>Tout est traité</strong><span>Aucune action prioritaire restante.</span></div>}
        </div>
      </section>

      <section className="director-v2-grid">
        <article className="director-v2-revenue">
          <header><div><h2>Revenus encaissés</h2><p>Six derniers mois</p></div><strong>412 850 DH</strong></header>
          <div className="director-v2-chart">
            {months.map(([month, height], index) => (
              <div key={month}><i className={index === months.length - 1 ? 'active' : ''} style={{ height: `${height}%` }}/><span>{month}</span></div>
            ))}
          </div>
          <footer><span>Objectif de juillet</span><strong>84 % atteint</strong></footer>
        </article>

        <article className="director-v2-schedule">
          <header><div><h2>Planning</h2><p>Prochaines sessions</p></div><Link href="/directeur/cohortes">Toutes les cohortes</Link></header>
          <div>
            {sessions.map(session => (
              <Link href="/directeur/planning" key={session.id}>
                <time><small>{new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(new Date(session.starts_at))}</small><strong>{new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(session.starts_at))}</strong></time>
                <i/>
                <span><strong>{session.cohorte || session.titre}</strong><small>{session.intervenant || 'Non affecté'}</small></span>
                <b>{session.titre}</b>
              </Link>
            ))}
            {!sessions.length && <div className="director-v2-empty"><strong>Aucune séance à venir</strong><span>Le planning est synchronisé avec le backend.</span></div>}
          </div>
        </article>

        <article className="director-v2-health">
          <header><div><h2>Santé du centre</h2><p>Performance globale</p></div><strong>87<small>/100</small></strong></header>
          <dl>
            <div><dt>Remplissage des cohortes</dt><dd><i><span style={{width:'84%'}}/></i><b>84 %</b></dd></div>
            <div><dt>Taux de recouvrement</dt><dd><i><span style={{width:'92%'}}/></i><b>92 %</b></dd></div>
            <div><dt>Satisfaction apprenants</dt><dd><i><span style={{width:'94%'}}/></i><b>4,7 / 5</b></dd></div>
          </dl>
          <Link href="/directeur/rapports">Consulter le rapport détaillé</Link>
        </article>
      </section>

      {showActionModal && (
        <div className="director-action-backdrop" onMouseDown={() => setShowActionModal(false)}>
          <section className="director-action-modal" role="dialog" aria-modal="true" aria-labelledby="new-action-title" onMouseDown={event => event.stopPropagation()}>
            <header>
              <div><span>Organisation</span><h2 id="new-action-title">Créer une nouvelle action</h2><p>Ajoutez une tâche au tableau de pilotage du centre.</p></div>
              <button type="button" onClick={() => setShowActionModal(false)} aria-label="Fermer">×</button>
            </header>
            <form onSubmit={createAction}>
              <label>
                Titre de l’action
                <input value={actionTitle} onChange={event => setActionTitle(event.target.value)} placeholder="Ex. Préparer la cohorte de septembre" required autoFocus/>
              </label>
              <div className="director-action-fields">
                <label>
                  Catégorie
                  <select value={actionCategory} onChange={event => setActionCategory(event.target.value)}>
                    <option>Cohortes</option><option>Paiements</option><option>Formateurs</option><option>Renouvellements</option>
                  </select>
                </label>
                <label>
                  Priorité
                  <select value={actionPriority} onChange={event => setActionPriority(event.target.value)}>
                    <option>Normale</option><option>Haute</option><option>Urgente</option>
                  </select>
                </label>
              </div>
              <label>
                Date d’échéance
                <input type="date" value={actionDueDate} onChange={event => setActionDueDate(event.target.value)} required/>
              </label>
              <footer>
                <button type="button" onClick={() => setShowActionModal(false)}>Annuler</button>
                <button type="submit">Créer l’action</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
