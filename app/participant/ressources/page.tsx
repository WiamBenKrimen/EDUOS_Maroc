'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

type FilterType = 'Tous' | 'Vidéos' | 'PDF' | 'Exercices' | 'QCM'
const FILTERS: FilterType[] = ['Tous', 'Vidéos', 'PDF', 'Exercices', 'QCM']

interface Resource {
  id: number
  title: string
  type: FilterType
  meta: string
  size: string
  week: number
  new?: boolean
}

const RESOURCES: Resource[] = [
  { id: 1, title: 'Cours 3 — Le présent perfect', type: 'Vidéos', meta: '24 min · HD', size: '', week: 3, new: true },
  { id: 2, title: 'Grammaire B2 — Récapitulatif', type: 'PDF', meta: '18 pages', size: '2.4 MB', week: 3 },
  { id: 3, title: 'Exercices — Présent perfect', type: 'Exercices', meta: '12 exercices', size: '0.8 MB', week: 3, new: true },
  { id: 4, title: 'QCM Semaine 3 — Évaluation', type: 'QCM', meta: '5 questions · 15 min', size: '', week: 3 },
  { id: 5, title: 'Cours 2 — Le prétérit simple', type: 'Vidéos', meta: '19 min · HD', size: '', week: 2 },
  { id: 6, title: 'Vocabulaire thématique B2', type: 'PDF', meta: '8 pages', size: '1.1 MB', week: 2 },
  { id: 7, title: 'Exercices — Conjugaison avancée', type: 'Exercices', meta: '10 exercices', size: '0.6 MB', week: 2 },
  { id: 8, title: 'Cours 1 — Introduction B2', type: 'Vidéos', meta: '15 min · HD', size: '', week: 1 },
  { id: 9, title: 'QCM Semaine 1 — Diagnostique', type: 'QCM', meta: '5 questions · 10 min', size: '', week: 1 },
]

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Choisissez la bonne phrase au Present Perfect :',
    options: [
      'I have lived in Rabat for 3 years.',
      'I live in Rabat since 3 years.',
      'I am living in Rabat 3 years ago.',
      'I had live in Rabat for 3 years.'
    ],
    correct: 0
  },
  {
    id: 2,
    question: 'Quel mot-clé est couramment utilisé avec le Present Perfect ?',
    options: ['Yesterday', 'Already', 'Last week', 'In 2010'],
    correct: 1
  },
  {
    id: 3,
    question: 'Complete: "She ______ to London twice this year."',
    options: ['went', 'has been', 'was going', 'goes'],
    correct: 1
  }
]

export default function RessourcesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Tous')
  const [toast, setToast] = useState<string | null>(null)
  
  // Modals
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<Resource | null>(null)
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleResourceAction = (r: Resource) => {
    if (r.type === 'Vidéos') {
      setActiveVideo(r)
    } else if (r.type === 'PDF' || r.type === 'Exercices') {
      const textContent = `EDUOS MAROC - RESSOURCE DE COURS\n` +
        `========================================\n` +
        `Titre: ${r.title}\n` +
        `Type: ${r.type}\n` +
        `Niveau: Anglais B2 Intermédiaire\n` +
        `Semaine: ${r.week}\n` +
        `Taille: ${r.size || 'Fichier PDF standard'}\n` +
        `========================================\n` +
        `Contenu pédagogique officiel EDUOS MAROC.`

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${r.title.replace(/ /g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      triggerToast(`Téléchargement de "${r.title}" effectué !`)
    } else if (r.type === 'QCM') {
      setQuizAnswers({})
      setQuizSubmitted(false)
      setActiveQuiz(r)
    }
  }

  const submitQuiz = () => {
    let score = 0
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score += 1
      }
    })
    setQuizScore(score)
    setQuizSubmitted(true)
    triggerToast(`Évaluation terminée ! Score: ${score}/${QUIZ_QUESTIONS.length}`)
  }

  const filtered = activeFilter === 'Tous' ? RESOURCES : RESOURCES.filter(r => r.type === activeFilter)

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: NAVY,
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.85rem',
          fontWeight: 600,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ color: '#10B981' }}>✓</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Ressources du cours</h1>
        <p style={{ fontSize: 13.5, color: '#64748b' }}>Support de formation · Anglais B2 — Niveau intermédiaire · Formateur K. Alaoui</p>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '18px 24px', marginBottom: 24, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Progression du module en cours</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: NAVY }}>6 / 9 complétées</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '67%', background: BLUE, borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 28, color: NAVY, letterSpacing: '-0.5px' }}>67%</div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = activeFilter === f
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                border: active ? 'none' : '1px solid #E2E8F0',
                background: active ? NAVY : '#fff',
                color: active ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: active ? 700 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {filtered.map((r) => {
          let btnLabel = 'Ouvrir'
          if (r.type === 'Vidéos') btnLabel = 'Regarder la vidéo'
          if (r.type === 'PDF') btnLabel = 'Télécharger PDF'
          if (r.type === 'Exercices') btnLabel = 'Télécharger Exercices'
          if (r.type === 'QCM') btnLabel = 'Passer le QCM'

          return (
            <div
              key={r.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 20,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(15,35,71,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {r.new && (
                <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, color: '#fff', background: GOLD, borderRadius: 99, padding: '2px 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Nouveau
                </span>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE, flexShrink: 0 }}>
                    {r.type === 'Vidéos' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                    {r.type === 'PDF' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                    {r.type === 'Exercices' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
                    {r.type === 'QCM' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.type}</span>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13.5, color: NAVY, marginTop: 2, lineHeight: 1.3 }}>
                      {r.title}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                  <span>{r.meta}</span>
                  <span style={{ background: '#F8FAFC', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>Sem. {r.week}</span>
                </div>
              </div>

              <button
                onClick={() => handleResourceAction(r)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 9,
                  border: 'none',
                  background: r.type === 'Vidéos' || r.type === 'QCM' ? BLUE : '#F1F5F9',
                  color: r.type === 'Vidéos' || r.type === 'QCM' ? '#fff' : NAVY,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {btnLabel}
              </button>
            </div>
          )
        })}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 640,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '16px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, margin: 0 }}>{activeVideo.title}</h3>
                <p style={{ fontSize: 11.5, color: '#94A3B8', margin: '2px 0 0' }}>{activeVideo.meta} · Anglais B2</p>
              </div>
              <button onClick={() => setActiveVideo(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#000', height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(2px)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <p style={{ fontSize: 13, marginTop: 16, opacity: 0.8 }}>Lecture de la ressource vidéo en haute définition...</p>
            </div>

            <div style={{ padding: 18, background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Formateur : K. Alaoui</span>
              <button
                onClick={() => {
                  setActiveVideo(null)
                  triggerToast('Visionnage de la vidéo enregistré !')
                }}
                style={{ padding: '8px 16px', borderRadius: 8, background: BLUE, color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
              >
                Marquer comme vu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 580,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>{activeQuiz.title}</h3>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>{activeQuiz.meta}</p>
              </div>
              <button onClick={() => setActiveQuiz(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24, maxHeight: 460, overflowY: 'auto' }}>
              {!quizSubmitted ? (
                <div>
                  {QUIZ_QUESTIONS.map((q, idx) => (
                    <div key={q.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: idx < QUIZ_QUESTIONS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: NAVY, marginBottom: 10 }}>
                        {idx + 1}. {q.question}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              background: quizAnswers[q.id] === optIdx ? '#EEF2FF' : '#fff',
                              cursor: 'pointer',
                              fontSize: 13,
                              color: NAVY
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={quizAnswers[q.id] === optIdx}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 9,
                      border: 'none',
                      background: Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length ? '#94A3B8' : BLUE,
                      color: '#fff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Valider mes réponses
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24, fontWeight: 900 }}>
                    ✓
                  </div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 20, color: NAVY, margin: 0 }}>Résultat du QCM</h4>
                  <div style={{ fontSize: 32, fontWeight: 900, color: BLUE, margin: '10px 0' }}>
                    {quizScore} / {QUIZ_QUESTIONS.length}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                    {quizScore === QUIZ_QUESTIONS.length ? 'Parfait ! Vous avez maîtrisé ce chapitre.' : 'Bon travail ! Révisez les points manquants dans le cours.'}
                  </p>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    style={{ padding: '11px 24px', borderRadius: 9, background: NAVY, color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                  >
                    Fermer le test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
