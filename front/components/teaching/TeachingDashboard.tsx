'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { formatDateTime, type TeachingDashboard as DashboardData } from '@/lib/teaching-types'

export default function TeachingDashboard({ kind }: { kind: 'formateur' | 'enseignant' }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<DashboardData>('/personnel/dashboard').then(setData).catch(error => {
      setError(error instanceof Error ? error.message : 'Impossible de charger le tableau de bord.')
    })
  }, [])

  const base = `/personnel/${kind}`
  const stats = data ? kind === 'formateur' ? [
    ['Formations actives', data.formations_actives, 'Cohortes affectées'],
    ['Apprenants suivis', data.apprenants, 'Inscriptions confirmées'],
    ['Heures ce mois', `${data.heures_mois} h`, 'Séances planifiées'],
    ['Évaluations', data.evaluations_a_corriger, 'À corriger'],
  ] : [
    ['Séances aujourd’hui', data.seances_aujourdhui, 'Programme du jour'],
    ['Apprenants', data.apprenants, 'Cohortes affectées'],
    ['Présences à valider', data.presences_a_valider, 'Feuilles ouvertes'],
    ['Copies à corriger', data.evaluations_a_corriger, 'Évaluations soumises'],
  ] : []

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ color: '#94A3B8', fontSize: 12 }}>Espace {kind}</p>
          <h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Bonjour {data?.nom?.split(' ')[0] ?? '…'}</h1>
          <p style={{ color: '#64748B', fontSize: 13 }}>{kind === 'formateur' ? 'Pilotez vos formations et vos actions pédagogiques.' : 'Retrouvez vos séances, présences et évaluations.'}</p>
        </div>
        <Link href={`${base}/${kind === 'enseignant' ? 'presence' : 'ressources'}`} className="btn-navy" style={{ textDecoration: 'none' }}>
          {kind === 'enseignant' ? 'Faire l’appel' : 'Ajouter une ressource'}
        </Link>
      </header>

      {error && <div className="auth-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
        {stats.map(([label, value, detail]) => <article key={String(label)} style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}>
          <span style={{ color: '#64748B', fontSize: 11 }}>{label}</span>
          <strong style={{ display: 'block', color: '#0F2347', fontSize: 23, margin: '7px 0 3px' }}>{value}</strong>
          <small style={{ color: '#A56D0B' }}>{detail}</small>
        </article>)}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .8fr', gap: 18 }}>
        <section style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: 18, borderBottom: '1px solid #F1F5F9' }}>
            <div><h2 style={{ color: '#0F2347', fontSize: 16 }}>{kind === 'formateur' ? 'Mes formations' : 'Programme du jour'}</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>Données synchronisées avec le planning du centre.</p></div>
            <Link href={`${base}/planning`} style={{ color: '#1B3A6B', fontSize: 12, fontWeight: 700 }}>Planning complet</Link>
          </header>
          {data && (kind === 'formateur' ? data.cohortes : data.programme_du_jour).length === 0 && <p style={{ padding: 24, color: '#64748B', fontSize: 13 }}>Aucune affectation disponible. Le directeur doit d’abord vous affecter à une cohorte ou une séance.</p>}
          {kind === 'formateur' ? data?.cohortes.map(cohort => <div key={cohort.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr .8fr 1fr', gap: 12, padding: 16, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
            <span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{cohort.formation}</strong><small style={{ color: '#64748B' }}>{cohort.nom}</small></span>
            <span style={{ color: '#475569', fontSize: 11 }}>{cohort.seances_terminees}/{cohort.seances_total} séances</span>
            <small style={{ color: '#1B3A6B', fontWeight: 700 }}>{cohort.prochaine_seance ? formatDateTime(cohort.prochaine_seance) : 'Aucune séance à venir'}</small>
          </div>) : data?.programme_du_jour.map(session => <div key={session.id} style={{ display: 'grid', gridTemplateColumns: '.7fr 1.4fr 1fr', gap: 12, padding: 16, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
            <strong style={{ color: '#1B3A6B' }}>{new Date(session.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>
            <span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{session.titre}</strong><small style={{ color: '#64748B' }}>{session.cohorte}</small></span>
            <small style={{ color: '#64748B' }}>{session.salle ?? 'Salle non définie'}</small>
          </div>)}
        </section>
        <aside style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}>
          <h2 style={{ color: '#0F2347', fontSize: 16 }}>Actions pédagogiques</h2>
          <div style={{ display: 'grid', gap: 9, marginTop: 15 }}>
            {[
              ['Valider les présences', `${base}/presence`],
              ['Gérer les évaluations', `${base}/evaluations`],
              ['Répondre aux messages', `${base}/messages`],
            ].map(([label, href]) => <Link key={label} href={href} style={{ padding: 13, borderRadius: 9, background: '#F8FAFC', color: '#1B3A6B', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{label}<span style={{ float: 'right' }}>›</span></Link>)}
          </div>
        </aside>
      </div>
    </div>
  )
}
