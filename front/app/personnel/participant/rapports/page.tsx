'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import type { ParticipantReport } from '@/lib/participant-types'

export default function RapportsPage() {
  const [reports, setReports] = useState<ParticipantReport[]>([])
  const [selected, setSelected] = useState<ParticipantReport | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { api.get<ParticipantReport[]>('/participant/reports').then(items => { setReports(items); setSelected(items[0] ?? null) }).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger les rapports.')) }, [])

  function download(items: ParticipantReport[]) {
    const content = items.map(report => [`${new Date(report.periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, `Formation : ${report.formation}`, `Score : ${report.score_global}/100`, `Présence : ${report.taux_presence}%`, report.appreciation ?? '', ...report.competences.map(item => `${item.competence} : ${item.score}%`)].join('\n')).join('\n\n---\n\n')
    const url = URL.createObjectURL(new Blob([`EDUOS MAROC — RAPPORT DE SUIVI\n\n${content}`], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = items.length > 1 ? 'Rapports_EDUOS.txt' : `Rapport_${items[0].periode}.txt`; anchor.click(); URL.revokeObjectURL(url); setNotice('Rapport exporté à partir des données publiées.')
  }

  const average = reports.length ? Math.round(reports.reduce((sum, report) => sum + Number(report.score_global), 0) / reports.length) : 0
  const attendance = reports.length ? Math.round(reports.reduce((sum, report) => sum + Number(report.taux_presence), 0) / reports.length) : 0

  return <div className="reports-v2">
    {notice && <div className="part-toast"><span>✓</span>{notice}</div>}{error && <div className="auth-error" role="alert">{error}</div>}
    <header className="reports-v2-head"><div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Rapports</span></div><h1>Rapports de suivi</h1><p>Rapports publiés par vos formateurs et enseignants.</p></div><button onClick={() => reports.length && download(reports)} disabled={!reports.length}>↓ Exporter tous les rapports</button></header>
    <section className="reports-v2-summary"><div className="reports-v2-score"><span>MOYENNE GÉNÉRALE</span><strong>{average}<small>/100</small></strong></div><div className="reports-v2-summary-line"><span>ASSIDUITÉ GLOBALE</span><strong>{attendance}%</strong><i><span style={{ width: `${attendance}%` }} /></i><small>D’après les rapports publiés</small></div><div className="reports-v2-summary-line"><span>RAPPORTS DISPONIBLES</span><strong>{reports.length}</strong><i><span style={{ width: reports.length ? '100%' : '0%' }} /></i><small>Documents pédagogiques vérifiés</small></div></section>
    <div className="reports-v2-workspace"><aside className="reports-v2-periods"><span>PÉRIODES DISPONIBLES</span>{reports.map(report => <button key={report.id} className={selected?.id === report.id ? 'active' : ''} onClick={() => setSelected(report)}><time><strong>{new Date(report.periode).toLocaleDateString('fr-FR', { month: 'short' })}</strong><small>{new Date(report.periode).getFullYear()}</small></time><span><strong>{report.score_global}/100</strong><small>{report.formation}</small></span><i>›</i></button>)}</aside><main className="reports-v2-reader">{!selected ? <p style={{ padding: 24, color: '#64748B' }}>Aucun rapport publié.</p> : <><header><div><span>RAPPORT MENSUEL</span><h2>{new Date(selected.periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2><p>{selected.formation} · {selected.formateur || 'Équipe pédagogique'}</p></div><div className="reports-v2-mark"><strong>{selected.score_global}</strong><small>/100</small></div></header><div className="reports-v2-body"><section className="reports-v2-skills"><div className="reports-v2-title"><span>COMPÉTENCES</span><h3>Niveau par domaine</h3></div>{selected.competences.map(item => <div className="reports-v2-skill" key={item.id}><span><strong>{item.competence}</strong><em>{item.score}%</em></span><i><span style={{ width: `${item.score}%` }} /></i></div>)}</section><aside className="reports-v2-insight"><span>ASSIDUITÉ</span><strong>{selected.taux_presence}%</strong><small>{selected.cohorte}</small><i><span style={{ width: `${selected.taux_presence}%` }} /></i></aside></div><blockquote><span>APPRÉCIATION DU FORMATEUR</span><p>“{selected.appreciation || 'Aucune appréciation.'}”</p></blockquote><footer><span>Rapport publié · EDUOS Maroc</span><button onClick={() => download([selected])}>Télécharger ce rapport →</button></footer></>}</main></div>
  </div>
}
