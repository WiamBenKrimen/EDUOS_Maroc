'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import type { Cohort } from '@/lib/teaching-types'

type Evaluation = { id: string; cohorte_id: string; titre: string; description: string | null; duree_minutes: number; score_max: number; publiee: boolean; created_at: string; cohorte: string; questions: number; tentatives: number }
type DraftQuestion = { texte: string; options: string[]; correcte: number }

const emptyQuestion = (): DraftQuestion => ({ texte: '', options: ['', '', '', ''], correcte: 0 })

export default function EvaluationsView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ cohorte_id: '', titre: '', description: '', duree_minutes: 30, publiee: true })
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()])

  const load = async () => {
    try {
      const [items, cohortItems] = await Promise.all([api.get<Evaluation[]>('/personnel/evaluations'), api.get<Cohort[]>('/personnel/cohorts')])
      setEvaluations(items); setCohorts(cohortItems); setForm(current => ({ ...current, cohorte_id: current.cohorte_id || cohortItems[0]?.id || '' }))
    } catch (error) { setError(error instanceof Error ? error.message : 'Impossible de charger les évaluations.') }
  }
  useEffect(() => { void load() }, [])

  function updateQuestion(index: number, update: Partial<DraftQuestion>) { setQuestions(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item)) }
  function updateOption(questionIndex: number, optionIndex: number, value: string) { setQuestions(current => current.map((question, index) => index === questionIndex ? { ...question, options: question.options.map((option, currentOption) => currentOption === optionIndex ? value : option) } : question)) }

  async function publish() {
    setError('')
    try {
      await api.post('/personnel/evaluations', {
        ...form, description: form.description || null, score_max: 100,
        questions: questions.map(question => ({ texte: question.texte, points: 1, options: question.options.filter(Boolean).map((texte, index) => ({ texte, correcte: index === question.correcte })) })),
      })
      setShowForm(false); setNotice('Évaluation et questions enregistrées dans PostgreSQL.'); setForm(current => ({ ...current, titre: '', description: '' })); setQuestions([emptyQuestion()]); await load()
    } catch (error) { setError(error instanceof Error ? error.message : 'Impossible de publier l’évaluation.') }
  }

  const valid = form.cohorte_id && form.titre.trim().length >= 2 && questions.every(question => question.texte.trim().length >= 2 && question.options.filter(Boolean).length >= 2 && Boolean(question.options[question.correcte]))

  return <div>
    <div className="op-page-header"><div><div className="op-breadcrumb"><span>Personnel</span><span className="op-breadcrumb-sep">›</span><span className="op-breadcrumb-active">Évaluations</span></div><h1 className="op-page-title">Évaluations & QCM</h1><p className="op-page-subtitle">Créez des évaluations pour les cohortes qui vous sont affectées.</p></div><button className="btn-navy" disabled={!cohorts.length} onClick={() => setShowForm(true)}>Nouvelle évaluation</button></div>
    {error && <div className="auth-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}{notice && <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#ECFDF5', color: '#047857' }}>{notice}</div>}
    <section className="op-card" style={{ overflow: 'hidden' }}>{evaluations.length === 0 && <p style={{ padding: 24, color: '#64748B' }}>Aucune évaluation enregistrée pour vos cohortes.</p>}{evaluations.map(item => <article key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr .7fr .7fr', gap: 14, padding: 17, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}><div><strong style={{ color: '#0F2347' }}>{item.titre}</strong><small style={{ display: 'block', color: '#64748B', marginTop: 4 }}>{item.cohorte}</small></div><span style={{ color: '#475569', fontSize: 12 }}>{item.questions} question(s) · {item.duree_minutes} min</span><span style={{ color: '#475569', fontSize: 12 }}>{item.tentatives} tentative(s)</span><span className={`badge ${item.publiee ? 'badge-green' : 'badge-gold'}`}>{item.publiee ? 'Publiée' : 'Brouillon'}</span></article>)}</section>
    {showForm && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1100, overflow: 'auto', padding: 24, background: 'rgba(9,24,46,.55)' }}><section className="op-card" style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: 24 }}><div className="row-between"><h2 style={{ color: '#0F2347' }}>Créer une évaluation</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Fermer</button></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginTop: 18 }}><label style={{ fontSize: 12, color: '#475569' }}>Titre<input value={form.titre} onChange={event => setForm(current => ({ ...current, titre: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label><label style={{ fontSize: 12, color: '#475569' }}>Durée (minutes)<input type="number" min="1" max="480" value={form.duree_minutes} onChange={event => setForm(current => ({ ...current, duree_minutes: Number(event.target.value) }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label></div><label style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#475569' }}>Cohorte<select value={form.cohorte_id} onChange={event => setForm(current => ({ ...current, cohorte_id: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }}>{cohorts.map(cohort => <option key={cohort.id} value={cohort.id}>{cohort.nom}</option>)}</select></label><label style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#475569' }}>Description<textarea rows={2} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label>
      <div style={{ marginTop: 20 }}>{questions.map((question, questionIndex) => <article key={questionIndex} style={{ padding: 16, border: '1px solid #E2E8F0', borderRadius: 10, marginBottom: 12 }}><div className="row-between"><strong style={{ color: '#0F2347', fontSize: 13 }}>Question {questionIndex + 1}</strong>{questions.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setQuestions(current => current.filter((_, index) => index !== questionIndex))}>Supprimer</button>}</div><input value={question.texte} onChange={event => updateQuestion(questionIndex, { texte: event.target.value })} placeholder="Texte de la question" style={{ width: '100%', marginTop: 10, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>{question.options.map((option, optionIndex) => <label key={optionIndex} style={{ display: 'flex', alignItems: 'center', gap: 7 }}><input type="radio" name={`correct-${questionIndex}`} checked={question.correcte === optionIndex} onChange={() => updateQuestion(questionIndex, { correcte: optionIndex })} /><input value={option} onChange={event => updateOption(questionIndex, optionIndex, event.target.value)} placeholder={`Option ${optionIndex + 1}`} style={{ flex: 1, padding: 9, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label>)}</div></article>)}</div><button className="btn btn-outline btn-sm" onClick={() => setQuestions(current => [...current, emptyQuestion()])}>Ajouter une question</button><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button><button className="btn-navy" onClick={publish} disabled={!valid}>Publier et enregistrer</button></div></section></div>}
  </div>
}
