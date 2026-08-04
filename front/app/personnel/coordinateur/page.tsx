'use client'

import Link from 'next/link'
import { getUser } from '../../../lib/auth'

const stats = [
  { label: 'Séances', value: '6', detail: 'Aujourd’hui', tone: 'navy' },
  { label: 'Participants', value: '90', detail: '4 groupes actifs', tone: 'green' },
  { label: 'Paiements', value: '8', detail: 'À vérifier', tone: 'gold' },
  { label: 'Intervenants', value: '12', detail: 'Enseignants et formateurs', tone: 'violet' },
]

const sessions = [
  { heure: '09:00', formation: 'Anglais B2', salle: 'Salle 1', formateur: 'M. Karimi', statut: 'En cours' },
  { heure: '10:00', formation: 'Maths avancés', salle: 'Salle 2', formateur: 'Mme Alami', statut: 'À venir' },
  { heure: '14:00', formation: 'Marketing digital', salle: 'Salle 4', formateur: 'M. Chraibi', statut: 'À venir' },
  { heure: '17:00', formation: 'Français A2', salle: 'Salle 1', formateur: 'Mme Bennouna', statut: 'À venir' },
]

const actions = [
  { label: 'Inscrire un participant', href: '/personnel/coordinateur/inscription' },
  { label: 'Vérifier les paiements', href: '/personnel/coordinateur/paiements' },
  { label: 'Gérer les intervenants', href: '/personnel/coordinateur/intervenants' },
]

export default function OperateurDashboardPage() {
  const user = getUser()
  const firstName = user?.nom?.split(' ')[0] ?? 'Sara'

  return (
    <div className="operator-simple operator-balanced">
      <header className="operator-simple-header">
        <div>
          <div className="operator-balanced-meta">
            <span>Lundi 28 juillet 2026</span>
            <small><i /> Centre ouvert</small>
          </div>
          <h1>Bonjour {firstName}</h1>
          <p>Voici un aperçu de l’activité du centre aujourd’hui.</p>
        </div>
        <div className="operator-balanced-header-side">
          <span><small>Prochaine séance</small><strong>10:00 · Maths avancés</strong></span>
          <Link href="/personnel/coordinateur/planning">Voir le planning</Link>
        </div>
      </header>

      <section className="operator-simple-stats" aria-label="Indicateurs du jour">
        {stats.map(stat => (
          <article className={`tone-${stat.tone}`} key={stat.label}>
            <span><i />{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>

      <div className="operator-simple-content">
        <section className="operator-simple-panel operator-simple-sessions">
          <header>
            <div>
              <h2>Séances du jour</h2>
              <p>Les prochaines activités planifiées.</p>
            </div>
            <Link href="/personnel/coordinateur/planning">Tout afficher</Link>
          </header>

          <div>
            {sessions.map(session => (
              <article key={`${session.heure}-${session.formation}`}>
                <time>{session.heure}</time>
                <div>
                  <strong>{session.formation}</strong>
                  <span>{session.salle} · {session.formateur}</span>
                </div>
                <small className={session.statut === 'En cours' ? 'active' : ''}>{session.statut}</small>
              </article>
            ))}
          </div>
        </section>

        <aside className="operator-simple-panel operator-simple-actions">
          <header>
            <h2>Actions rapides</h2>
            <p>Accès aux tâches principales.</p>
          </header>

          <nav>
            {actions.map(action => (
              <Link href={action.href} key={action.href}>
                <span>{action.label}</span>
                <i>→</i>
              </Link>
            ))}
          </nav>

          <div className="operator-simple-note">
            <span>À vérifier</span>
            <strong>3 paiements en retard</strong>
            <Link href="/personnel/coordinateur/paiements">Consulter</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
