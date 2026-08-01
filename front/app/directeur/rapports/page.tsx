'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api-client'
import SearchFilterBar from '../search-filter-bar'

type ProgressReport = {
  id: string
  participant: string
  formation: string
  cohorte: string
  periode: string
  score_global: number | string
  taux_presence: number | string
  appreciation: string | null
  publie_at: string | null
}

export default function RapportsPage() {
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.get<ProgressReport[]>('/director/reports')
      .then(setReports)
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Chargement impossible.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fr-FR')
    return reports.filter(report => !query || [
      report.participant,
      report.formation,
      report.cohorte,
      report.appreciation,
    ].some(value => String(value ?? '').toLocaleLowerCase('fr-FR').includes(query)))
  }, [reports, searchQuery])

  function download(report: ProgressReport) {
    const content = [
      'EDUOS MAROC - RAPPORT DE SUIVI',
      `Apprenant : ${report.participant}`,
      `Formation : ${report.formation}`,
      `Cohorte : ${report.cohorte}`,
      `Période : ${report.periode}`,
      `Score global : ${report.score_global}/100`,
      `Taux de présence : ${report.taux_presence}%`,
      '',
      report.appreciation ?? 'Aucune appréciation.',
    ].join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `rapport-${report.participant.toLocaleLowerCase('fr-FR').replaceAll(' ', '-')}-${report.periode}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const averageScore = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + Number(report.score_global), 0) / reports.length)
    : 0
  const averageAttendance = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + Number(report.taux_presence), 0) / reports.length)
    : 0

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Direction</span><span className="page-breadcrumb-sep">›</span><span>Rapports</span></div>
          <h1 className="page-title">Rapports & suivi</h1>
          <p className="page-subtitle">Bilans pédagogiques publiés par votre centre.</p>
        </div>
      </header>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        <div className="kpi-card"><div className="card-meta">Rapports disponibles</div><div className="kpi-value">{reports.length}</div></div>
        <div className="kpi-card"><div className="card-meta">Score global moyen</div><div className="kpi-value">{averageScore}/100</div></div>
        <div className="kpi-card"><div className="card-meta">Présence moyenne</div><div className="kpi-value">{averageAttendance}%</div></div>
      </div>

      <SearchFilterBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un apprenant, une formation ou une cohorte..." resultCount={filtered.length} />
      {error && <div className="card card-p" role="alert" style={{ color: '#B91C1C', marginBottom: 16 }}>{error}</div>}
      {loading && <div className="card card-p" style={{ textAlign: 'center' }}>Chargement depuis FastAPI…</div>}
      {!loading && !filtered.length && <div className="card card-p" style={{ textAlign: 'center', color: '#64748B' }}>Aucun rapport publié.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {filtered.map(report => (
          <article key={report.id} className="card card-p">
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div><div className="card-meta">{new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(report.periode))}</div><h2 style={{ marginTop: 4, fontSize: 17 }}>{report.participant}</h2></div>
              <span className={`badge ${report.publie_at ? 'badge-green' : 'badge-navy'}`}>{report.publie_at ? 'Publié' : 'Brouillon'}</span>
            </div>
            <p style={{ color: '#64748B', marginTop: 6 }}>{report.formation} · {report.cohorte}</p>
            <div className="row" style={{ marginTop: 14 }}>
              <strong>{Number(report.score_global)}/100</strong><span className="card-meta">Score</span>
              <strong style={{ marginLeft: 14 }}>{Number(report.taux_presence)}%</strong><span className="card-meta">Présence</span>
            </div>
            <p style={{ marginTop: 14, lineHeight: 1.55 }}>{report.appreciation || 'Aucune appréciation.'}</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => download(report)}>Télécharger</button>
          </article>
        ))}
      </div>
    </div>
  )
}
