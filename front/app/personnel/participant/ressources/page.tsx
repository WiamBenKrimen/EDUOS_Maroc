'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  CheckCircle,
  ClipboardText,
  File,
  FilePdf,
  FileText,
  FunnelSimple,
  Image as ImageIcon,
  MagnifyingGlass,
  Play,
  SquaresFour,
  SpinnerGap,
  VideoCamera,
  X,
} from '@phosphor-icons/react'
import { api } from '@/lib/api-client'
import { formatBytes, type ParticipantResource } from '@/lib/participant-types'

type Evaluation = { id: string; titre: string; description: string | null; duree_minutes: number; score_max: number; cohorte: string; formation: string; questions: number; submitted_at: string | null; score: number | null }
type EvaluationDetail = Evaluation & { questions: Array<{ id: string; texte: string; options: Array<{ id: string; texte: string }> }> }
type LibraryItem = { id: string; kind: 'resource' | 'evaluation'; title: string; description: string | null; type: string; rawType: string; mimeType: string | null; storageKey: string | null; meta: string; week: number | null; isNew: boolean; progression: number; formation: string; cohorte: string; source: ParticipantResource | Evaluation }

const labels: Record<string, string> = { video: 'Vidéo', pdf: 'PDF', exercice: 'Exercice', qcm: 'QCM', document: 'Document', dossier: 'Dossier', image: 'Image' }
const PAGE_SIZE = 6

function mediaKind(item: LibraryItem) {
  const mime = item.mimeType?.toLowerCase() ?? ''
  if (mime.startsWith('video/') || item.rawType === 'video') return 'video'
  if (mime === 'application/pdf' || item.rawType === 'pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  if (item.kind === 'evaluation') return 'evaluation'
  return 'document'
}

function MediaFallback({ item }: { item: LibraryItem }) {
  const kind = mediaKind(item)
  return <div className={`resource-media-fallback is-${kind}`}>
    <span className="resource-media-mark" aria-hidden="true">
      {kind === 'video' && <VideoCamera size={34} weight="duotone" />}
      {kind === 'pdf' && <FilePdf size={34} weight="duotone" />}
      {kind === 'image' && <ImageIcon size={34} weight="duotone" />}
      {kind === 'evaluation' && <ClipboardText size={34} weight="duotone" />}
      {kind === 'document' && <FileText size={34} weight="duotone" />}
    </span>
    <span>{kind === 'evaluation' ? 'Évaluation en ligne' : item.type}</span>
  </div>
}

function ResourceMedia({ item, eager = false }: { item: LibraryItem; eager?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(eager)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const kind = mediaKind(item)

  useEffect(() => {
    if (eager || !rootRef.current || visible) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px' })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [eager, visible])

  useEffect(() => {
    if (!visible || item.kind !== 'resource' || !item.storageKey) return
    let cancelled = false
    let objectUrl: string | null = null

    if (/^https?:\/\//.test(item.storageKey) && kind !== 'pdf') {
      setPreviewUrl(item.storageKey)
      return
    }

    if (!item.storageKey.startsWith('db:')) return
    setLoading(true)
    const controller = new AbortController()
    const previewPath = kind === 'image'
      ? `/participant/resources/${item.id}/preview`
      : `/participant/resources/${item.id}/download`
    void api.download(previewPath, { signal: controller.signal })
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => {
      cancelled = true
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item.id, item.kind, item.storageKey, kind, visible])

  return <div ref={rootRef} className={`resource-media is-${kind}`}>
    {!failed && previewUrl && kind === 'video'
      ? <video src={previewUrl} muted playsInline preload="metadata" aria-label={`Aperçu vidéo : ${item.title}`} onLoadedMetadata={event => { event.currentTarget.currentTime = .1 }} onError={() => setFailed(true)} />
      : !failed && previewUrl && kind === 'pdf'
        ? <iframe src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`} title={`Aperçu du document : ${item.title}`} tabIndex={-1} />
        : !failed && previewUrl
          ? <img src={previewUrl} alt={`Aperçu de ${item.title}`} onError={() => setFailed(true)} />
          : <MediaFallback item={item} />}
    {loading && <div className="resource-media-loading" aria-label="Chargement de l’aperçu"><SpinnerGap size={24} /></div>}
    {kind === 'video' && <span className="resource-play" aria-hidden="true"><Play size={20} weight="fill" /></span>}
  </div>
}

function ResourceViewer({ item, onClose, onComplete }: { item: LibraryItem; onClose: () => void; onComplete: () => void }) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const kind = mediaKind(item)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    const source = item.storageKey
    if (!source) {
      setLoading(false)
      setError('Aucun fichier n’est associé à cette ressource.')
      return
    }
    if (/^https?:\/\//.test(source)) {
      setFileUrl(source)
      setLoading(false)
      return
    }
    void api.download(`/participant/resources/${item.id}/download`)
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setFileUrl(objectUrl)
      })
      .catch(loadError => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le fichier.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item.id, item.storageKey])

  return <div className="library-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="resource-viewer" role="dialog" aria-modal="true" aria-label={item.title}>
      <header>
        <div><span>{item.type}</span><h2>{item.title}</h2></div>
        <button type="button" onClick={onClose} aria-label="Fermer"><X size={22} /></button>
      </header>
      <div className={`resource-viewer-stage is-${kind}`}>
        {loading && <div className="resource-viewer-state"><SpinnerGap size={30} /><strong>Préparation du fichier</strong><span>Le contenu arrive dans un instant.</span></div>}
        {!loading && error && <div className="resource-viewer-state is-error"><File size={34} /><strong>Aperçu indisponible</strong><span>{error}</span></div>}
        {!loading && fileUrl && kind === 'video' && <video src={fileUrl} controls playsInline preload="metadata" />}
        {!loading && fileUrl && kind === 'pdf' && <iframe src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`} title={`Document PDF : ${item.title}`} />}
        {!loading && fileUrl && kind === 'image' && <img src={fileUrl} alt={item.title} />}
        {!loading && fileUrl && kind === 'document' && <div className="resource-viewer-state is-document"><FileText size={36} /><strong>Document prêt à consulter</strong><span>Ouvrez-le dans un nouvel onglet pour utiliser votre application habituelle.</span></div>}
      </div>
      <footer>
        <div><span>{item.meta}</span>{item.week && <span>Semaine {item.week}</span>}</div>
        <div>
          {fileUrl && <button type="button" className="resource-secondary-action" onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}>Nouvel onglet <ArrowUpRight size={16} /></button>}
          <button type="button" className="resource-primary-action" onClick={onComplete}><CheckCircle size={17} /> Marquer comme terminée</button>
        </div>
      </footer>
    </section>
  </div>
}

export default function RessourcesPage() {
  const [resources, setResources] = useState<ParticipantResource[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<LibraryItem | null>(null)
  const [quiz, setQuiz] = useState<EvaluationDetail | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    try {
      const [resourceItems, evaluationItems] = await Promise.all([api.get<ParticipantResource[]>('/participant/resources'), api.get<Evaluation[]>('/participant/evaluations')])
      setResources(resourceItems)
      setEvaluations(evaluationItems)
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les ressources.')
    } finally { setIsLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const items = useMemo<LibraryItem[]>(() => [
    ...resources.map(item => ({ id: item.id, kind: 'resource' as const, title: item.titre, description: item.description, type: labels[item.type] ?? item.type, rawType: item.type, mimeType: item.mime_type, storageKey: item.storage_key, meta: item.duree_minutes ? `${item.duree_minutes} min` : formatBytes(item.taille_octets), week: item.semaine, isNew: item.nouveau, progression: item.progression, formation: item.formation, cohorte: item.cohorte, source: item })),
    ...evaluations.map(item => ({ id: item.id, kind: 'evaluation' as const, title: item.titre, description: item.description, type: 'QCM', rawType: 'qcm', mimeType: null, storageKey: null, meta: `${item.questions} questions, ${item.duree_minutes} min`, week: null, isNew: !item.submitted_at, progression: item.submitted_at ? 100 : 0, formation: item.formation, cohorte: item.cohorte, source: item })),
  ], [resources, evaluations])
  const filtered = useMemo(() => items.filter(item => (filter === 'Tous' || item.type === filter) && `${item.title} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [items, filter, query])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visibleItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const globalProgress = items.length ? Math.round(items.reduce((sum, item) => sum + item.progression, 0) / items.length) : 0

  useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount])

  async function open(item: LibraryItem) {
    setError('')
    if (item.kind === 'evaluation') {
      setActive(item)
      try { setQuiz(await api.get<EvaluationDetail>(`/participant/evaluations/${item.id}`)); setAnswers({}) }
      catch (openError) { setError(openError instanceof Error ? openError.message : 'Impossible d’ouvrir le QCM.') }
      return
    }
    setActive(item)
    try {
      await api.patch(`/participant/resources/${item.id}/progress`, { progression: Math.max(item.progression, 25) })
      await load()
    } catch (openError) { setError(openError instanceof Error ? openError.message : 'Impossible de mettre à jour la progression.') }
  }

  async function completeResource() {
    if (!active || active.kind !== 'resource') return
    await api.patch(`/participant/resources/${active.id}/progress`, { progression: 100 })
    setNotice('Ressource marquée comme terminée.')
    setActive(null)
    await load()
  }

  async function submitQuiz() {
    if (!quiz) return
    if (quiz.questions.some(question => !answers[question.id])) { setError('Répondez à toutes les questions.'); return }
    try {
      const result = await api.post<{ score: number }>(`/participant/evaluations/${quiz.id}/submit`, { answers: quiz.questions.map(question => ({ question_id: question.id, option_id: answers[question.id] })) })
      setNotice(`Évaluation soumise. Score : ${result.score}/${quiz.score_max}.`)
      setQuiz(null)
      setActive(null)
      await load()
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Impossible de soumettre le QCM.') }
  }

  return <div className="library-page resource-library">
    <header className="library-header">
      <div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Ressources</span></div><h1>Ressources du cours</h1><p>Retrouvez vos supports, vidéos et évaluations dans un espace clair.</p></div>
      <div className="resource-progress"><span>Progression globale</span><strong>{globalProgress}%</strong><i aria-hidden="true"><span style={{ width: `${globalProgress}%` }} /></i></div>
    </header>
    {error && <div className="auth-error" role="alert">{error}</div>}
    {notice && <div className="part-toast"><CheckCircle size={18} weight="fill" />{notice}</div>}
    <div className="library-toolbar">
      <label><MagnifyingGlass size={19} aria-hidden="true" /><span className="sr-only">Rechercher une ressource</span><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Rechercher par titre ou par type..." /></label>
      <div className="resource-filter"><FunnelSimple size={17} aria-hidden="true" /><select aria-label="Filtrer les ressources" value={filter} onChange={event => { setFilter(event.target.value); setPage(1) }}><option>Tous</option><option>Vidéo</option><option>PDF</option><option>Exercice</option><option>QCM</option><option>Document</option><option>Image</option></select></div>
      <button type="button" className="resource-layout-toggle" aria-pressed={view === 'grid'} onClick={() => { setView(current => current === 'grid' ? 'list' : 'grid'); setPage(1) }}>
        <span aria-hidden="true"><i /></span><SquaresFour size={17} />3 par ligne
      </button>
    </div>
    {isLoading
      ? <div className="resource-items resource-skeleton-grid" aria-label="Chargement des ressources">{[0, 1, 2, 3, 4, 5].map(item => <div className="resource-skeleton-card" key={item}><span /><i /><b /><em /></div>)}</div>
      : <div className={`library-items resource-items ${view}`}>
          {visibleItems.map(item => <article className={`resource-card is-${mediaKind(item)}`} key={`${item.kind}-${item.id}`}>
            <ResourceMedia item={item} />
            <div className="resource-card-body">
              <div className="resource-card-labels"><span>{item.type}</span>{item.isNew && <span className="resource-new">Nouveau</span>}</div>
              <h2>{item.title}</h2>
              <p>{item.description || (item.kind === 'evaluation' ? 'Testez vos acquis et consultez votre score.' : `${item.formation}, ${item.cohorte}`)}</p>
              <div className="resource-card-meta"><span>{item.meta}</span>{item.week && <span>Semaine {item.week}</span>}</div>
              <div className="resource-card-progress"><span style={{ width: `${item.progression}%` }} /></div>
            </div>
            <div className="library-actions"><button type="button" onClick={() => void open(item)}>{item.kind === 'evaluation' ? (item.progression === 100 ? `Score ${String((item.source as Evaluation).score)}/${(item.source as Evaluation).score_max}` : 'Passer le QCM') : 'Consulter'}<ArrowUpRight size={16} /></button></div>
          </article>)}
          {!filtered.length && <div className="library-empty"><MagnifyingGlass size={27} /><strong>Aucune ressource trouvée</strong><span>Essayez un autre mot-clé ou modifiez le filtre.</span></div>}
        </div>}
    {!isLoading && filtered.length > 0 && <nav className="resource-pagination" aria-label="Pagination des ressources">
      <span>{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
      <div><button type="button" disabled={page === 1} onClick={() => setPage(current => current - 1)} aria-label="Page précédente"><CaretLeft size={17} /></button><strong>Page {page} sur {pageCount}</strong><button type="button" disabled={page === pageCount} onClick={() => setPage(current => current + 1)} aria-label="Page suivante"><CaretRight size={17} /></button></div>
    </nav>}
    {active?.kind === 'resource' && <ResourceViewer item={active} onClose={() => setActive(null)} onComplete={() => void completeResource()} />}
    {quiz && !quiz.submitted_at && <div className="library-overlay quiz-overlay"><div className="library-preview quiz-preview" role="dialog" aria-modal="true" aria-label={quiz.titre}><header><span>QCM, {quiz.duree_minutes} min</span><button onClick={() => { setQuiz(null); setActive(null) }} aria-label="Fermer"><X size={21} /></button></header><div className="quiz-content"><h2>{quiz.titre}</h2>{quiz.questions.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.texte}</legend>{question.options.map(option => <label key={option.id}><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => setAnswers(current => ({ ...current, [question.id]: option.id }))} /><span>{option.texte}</span></label>)}</fieldset>)}</div><button onClick={() => void submitQuiz()}>Soumettre l’évaluation</button></div></div>}
  </div>
}
