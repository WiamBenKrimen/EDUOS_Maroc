'use client'

import { useState } from 'react'

interface Question { id: number; text: string; options: string[]; correct: number }

const INITIAL_QS: Question[] = [
  { id: 1, text: "Quel est l'antonyme du mot 'rapide' ?", options: ['Lent', 'Vif', 'Agile', 'Prompt'], correct: 0 },
  { id: 2, text: "Conjuguez 'aller' au présent, 3ème personne du pluriel.", options: ['Ils vont', 'Ils allaient', 'Ils iront', 'Ils sont allés'], correct: 0 },
  { id: 3, text: "Quelle est la capitale du Maroc ?", options: ['Casablanca', 'Rabat', 'Marrakech', 'Fès'], correct: 1 },
]

export default function EvaluationsPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QS)
  const [title, setTitle] = useState("Évaluation Anglais B1 — Juillet 2025")
  const [group, setGroup] = useState("Anglais B1 — Matin")
  const [duration, setDuration] = useState("30 minutes")
  const [adding, setAdding] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newOpts, setNewOpts] = useState(['', '', '', ''])
  const [newCorrect, setNewCorrect] = useState(0)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const addQuestion = () => {
    if (!newQ.trim()) return
    setQuestions(prev => [...prev, { id: Date.now(), text: newQ, options: newOpts.map((o, i) => o || `Option ${i + 1}`), correct: newCorrect }])
    setNewQ(''); setNewOpts(['','','','']); setNewCorrect(0); setAdding(false)
    triggerToast('Question ajoutée au QCM !')
  }

  const removeQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
    triggerToast('Question supprimée.')
  }

  const handlePublish = () => {
    setShowPublishModal(true)
  }

  return (
    <div>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#1B3A6B', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(27,58,107,.3)' }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Personnel</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Évaluations</span>
          </div>
          <h1 className="page-title">Évaluations & QCM</h1>
          <p className="page-subtitle">Créez et publiez les questionnaires d'évaluation pour les apprenants</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setAdding(!adding)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter une question
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePublish}>
            Publier le QCM
          </button>
        </div>
      </div>

      {/* QCM Info Settings Card */}
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Titre du QCM</label>
            <input className="search-input" style={{ width: '100%', paddingLeft: 12, fontWeight: 700, color: '#1B3A6B' }} value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Groupe cible</label>
            <select className="search-input" style={{ width: 180, paddingLeft: 10 }} value={group} onChange={e => setGroup(e.target.value)}>
              <option>Anglais B1 — Matin</option>
              <option>Français A2 — Soir</option>
              <option>Maths Avancés</option>
            </select>
          </div>

          <div>
            <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Durée</label>
            <select className="search-input" style={{ width: 130, paddingLeft: 10 }} value={duration} onChange={e => setDuration(e.target.value)}>
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option>60 minutes</option>
            </select>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="card-meta">Total</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: '1.4rem', color: '#1B3A6B' }}>
              {questions.length} <span style={{ fontSize: '.78rem', color: '#9AABBC', fontWeight: 600 }}>questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Form */}
      {adding && (
        <div className="card card-p" style={{ marginBottom: 20, border: '2px solid #1B3A6B' }}>
          <h3 className="card-title" style={{ color: '#1B3A6B', marginBottom: 14 }}>Nouvelle question</h3>
          <input className="search-input" style={{ width: '100%', paddingLeft: 12, marginBottom: 14 }} placeholder="Texte de la question…" value={newQ} onChange={e => setNewQ(e.target.value)} />
          
          <div className="section-grid-2" style={{ marginBottom: 16 }}>
            {newOpts.map((o, oi) => (
              <div key={oi} className="row" style={{ gap: 8 }}>
                <input type="radio" name="correct" checked={newCorrect === oi} onChange={() => setNewCorrect(oi)} style={{ cursor: 'pointer' }} />
                <input className="search-input" style={{ paddingLeft: 12 }} placeholder={`Option ${oi + 1}${newCorrect === oi ? ' ✓ (Correcte)' : ''}`} value={o} onChange={e => { const n = [...newOpts]; n[oi] = e.target.value; setNewOpts(n) }} />
              </div>
            ))}
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>Annuler</button>
            <button className="btn btn-primary btn-sm" onClick={addQuestion}>Ajouter au QCM</button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, qi) => (
          <div key={q.id} className="card card-p">
            <div className="row-between" style={{ marginBottom: 12 }}>
              <div className="row">
                <span className="avatar avatar-sm avatar-navy" style={{ width: 28, height: 28, fontSize: '.75rem' }}>{qi + 1}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.9rem', color: '#1a2535' }}>{q.text}</span>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }} onClick={() => removeQuestion(q.id)}>
                Supprimer
              </button>
            </div>

            <div className="section-grid-2" style={{ gap: 8 }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ padding: '8px 12px', borderRadius: 7, background: oi === q.correct ? 'rgba(5,150,105,.09)' : '#F8F9FB', border: `1px solid ${oi === q.correct ? 'rgba(5,150,105,.25)' : '#E8ECF2'}`, color: oi === q.correct ? '#059669' : '#5A6B7D', fontSize: '.8rem', fontWeight: oi === q.correct ? 700 : 400 }}>
                  {oi === q.correct ? '✓ ' : ''}{opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
            <div className="avatar avatar-md avatar-green" style={{ width: 44, height: 44, margin: '0 auto 12px' }}>✓</div>
            <h2 className="page-title" style={{ fontSize: '1.2rem', marginBottom: 4 }}>QCM Publié !</h2>
            <p className="card-meta" style={{ marginBottom: 16 }}>L'évaluation <strong>{title}</strong> est maintenant accessible aux apprenants de <strong>{group}</strong>.</p>

            <div style={{ background: '#F8F9FB', borderRadius: 8, padding: '12px', marginBottom: 16, fontSize: '.78rem', color: '#1B3A6B', fontWeight: 600, border: '1px solid #E8ECF2' }}>
              🔗 Lien d'accès: https://eduos.ma/eval/qcm-{Math.floor(1000 + Math.random() * 9000)}
            </div>

            <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setShowPublishModal(false); triggerToast('Lien du QCM copié !'); }}>
              Fermer et copier le lien
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
