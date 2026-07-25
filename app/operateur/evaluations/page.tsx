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
  const [adding, setAdding] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newOpts, setNewOpts] = useState(['', '', '', ''])
  const [newCorrect, setNewCorrect] = useState(0)

  function addQuestion() {
    if (!newQ.trim()) return
    setQuestions(prev => [...prev, { id: Date.now(), text: newQ, options: newOpts, correct: newCorrect }])
    setNewQ(''); setNewOpts(['','','','']); setNewCorrect(0); setAdding(false)
  }

  function removeQuestion(id: number) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Évaluations & QCM</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Créez et gérez vos questionnaires d'évaluation</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setAdding(!adding)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter une question
          </button>
        </div>
      </div>

      {/* QCM info */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #E2D9CC', marginBottom: 24, display: 'flex', gap: 28, alignItems: 'center', boxShadow: '0 2px 10px rgba(27,58,107,.04)' }}>
        <div>
          <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#94a3b8', marginBottom: 4 }}>Titre du QCM</div>
          <input defaultValue="Évaluation Anglais B1 — Juillet 2025" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '1rem', color: '#1a1823', border: 'none', outline: 'none', width: 320 }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#94a3b8', marginBottom: 4 }}>Groupe</div>
          <select style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.88rem', color: '#374151', border: 'none', outline: 'none', cursor: 'pointer' }}>
            <option>Anglais B1 — Matin</option>
            <option>Français A2 — Soir</option>
          </select>
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#94a3b8', marginBottom: 4 }}>Durée</div>
          <select style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.88rem', color: '#374151', border: 'none', outline: 'none', cursor: 'pointer' }}>
            <option>30 minutes</option>
            <option>45 minutes</option>
            <option>60 minutes</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#1B3A6B' }}>{questions.length} <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, fontSize: '.82rem', color: '#94a3b8' }}>questions</span></div>
        </div>
        <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#C9922A', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          Publier le QCM
        </button>
      </div>

      {/* Add question form */}
      {adding && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1.5px solid #1B3A6B', marginBottom: 20, boxShadow: '0 4px 20px rgba(27,58,107,.1)' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '1rem', color: '#1B3A6B', marginBottom: 16 }}>Nouvelle question</h3>
          <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Texte de la question…" style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {newOpts.map((o, oi) => (
              <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" name="correct" checked={newCorrect === oi} onChange={() => setNewCorrect(oi)} style={{ cursor: 'pointer' }} />
                <input value={o} onChange={e => { const n = [...newOpts]; n[oi] = e.target.value; setNewOpts(n) }} placeholder={`Option ${oi + 1}${newCorrect === oi ? ' ✓ correcte' : ''}`} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${newCorrect === oi ? '#059669' : '#E2D9CC'}`, fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={addQuestion} style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: '#1B3A6B', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.84rem', cursor: 'pointer' }}>Ajouter</button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 20px', borderRadius: 9, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.84rem', color: '#64748b', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, qi) => (
          <div key={q.id} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #E2D9CC', boxShadow: '0 2px 10px rgba(27,58,107,.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(27,58,107,.07)', color: '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{qi + 1}</span>
                <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.92rem', color: '#1a1823' }}>{q.text}</p>
              </div>
              <button onClick={() => removeQuestion(q.id)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#DC2626', cursor: 'pointer', flexShrink: 0 }}>Supprimer</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {q.options.map((o, oi) => (
                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: oi === q.correct ? 'rgba(5,150,105,.07)' : '#faf8f5', border: `1px solid ${oi === q.correct ? 'rgba(5,150,105,.2)' : '#f1ede8'}` }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${oi === q.correct ? '#059669' : '#E2D9CC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {oi === q.correct && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }}/>}
                  </div>
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: oi === q.correct ? '#059669' : '#374151', fontWeight: oi === q.correct ? 600 : 400 }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
