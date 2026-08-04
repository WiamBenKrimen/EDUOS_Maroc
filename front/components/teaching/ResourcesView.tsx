'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  FilePdf,
  FileText,
  FunnelSimple,
  Image as ImageIcon,
  MagnifyingGlass,
  Plus,
  SpinnerGap,
  SquaresFour,
  VideoCamera,
} from '@phosphor-icons/react'
import { api } from '@/lib/api-client'
import type { Cohort } from '@/lib/teaching-types'

type ResourceType = 'dossier' | 'pdf' | 'video' | 'document' | 'exercice' | 'qcm'
type Resource = {
  id: string
  cohorte_id: string
  type: ResourceType
  titre: string
  description: string | null
  storage_key: string | null
  mime_type: string | null
  taille_octets: number | null
  duree_minutes: number | null
  semaine: number | null
  publie: boolean
  created_at: string
  cohorte: string
  formation: string
  auteur: string
}
type DriveStatus = {
  configured: boolean
  connected: boolean
  account_email: string | null
}

const MAX_FILE_SIZE = 50 * 1024 * 1024
const PAGE_SIZE = 6
const typeLabels: Record<ResourceType, string> = {
  dossier: 'Dossier',
  pdf: 'PDF',
  video: 'Vidéo',
  document: 'Document',
  exercice: 'Exercice',
  qcm: 'QCM',
}

function resourceMediaKind(item: Resource) {
  const mime = item.mime_type?.toLowerCase() ?? ''
  if (mime.startsWith('video/') || item.type === 'video') return 'video'
  if (mime === 'application/pdf' || item.type === 'pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  return 'document'
}

function formatResourceSize(value: number | null) {
  if (value === null) return 'Taille inconnue'
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} Ko`
  return `${(value / 1024 / 1024).toFixed(1)} Mo`
}

function TeachingResourceMedia({ item }: { item: Resource }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const kind = resourceMediaKind(item)

  useEffect(() => {
    if (!rootRef.current || visible) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px' })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible || !item.storage_key) return
    let cancelled = false
    let objectUrl: string | null = null
    if (/^https?:\/\//.test(item.storage_key) && kind !== 'pdf') {
      setPreviewUrl(item.storage_key)
      return
    }
    if (!item.storage_key.startsWith('gdrive:')) return
    setLoading(true)
    void api.download(`/personnel/resources/${item.id}/preview`)
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item.id, item.storage_key, kind, visible])

  return <div ref={rootRef} className={`resource-media is-${kind}`}>
    {!failed && previewUrl && kind === 'video' && /^https?:\/\//.test(item.storage_key ?? '')
      ? <video src={previewUrl} muted playsInline preload="metadata" aria-label={`Aperçu vidéo : ${item.titre}`} onLoadedMetadata={event => { event.currentTarget.currentTime = .1 }} onError={() => setFailed(true)} />
      : !failed && previewUrl
        ? <img src={previewUrl} alt={`Aperçu de ${item.titre}`} onError={() => setFailed(true)} />
        : <div className={`resource-media-fallback is-${kind}`}><span className="resource-media-mark" aria-hidden="true">{kind === 'video' ? <VideoCamera size={34} weight="duotone" /> : kind === 'pdf' ? <FilePdf size={34} weight="duotone" /> : kind === 'image' ? <ImageIcon size={34} weight="duotone" /> : <FileText size={34} weight="duotone" />}</span><span>{typeLabels[item.type]}</span></div>}
    {loading && <div className="resource-media-loading" aria-label="Chargement de l’aperçu"><SpinnerGap size={24} /></div>}
  </div>
}

export default function ResourcesView() {
  const [resources, setResources] = useState<Resource[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadPhase, setUploadPhase] = useState<'upload' | 'drive'>('upload')
  const [connecting, setConnecting] = useState(false)
  const [drive, setDrive] = useState<DriveStatus>({
    configured: false,
    connected: false,
    account_email: null,
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    cohorte_id: '',
    type: 'pdf' as ResourceType,
    titre: '',
    description: '',
    publie: true,
  })

  const load = async () => {
    try {
      const [items, cohortItems, driveStatus] = await Promise.all([
        api.get<Resource[]>('/personnel/resources'),
        api.get<Cohort[]>('/personnel/cohorts'),
        api.get<DriveStatus>('/personnel/resources/google/status'),
      ])
      setResources(items)
      setCohorts(cohortItems)
      setDrive(driveStatus)
      setForm(current => ({
        ...current,
        cohorte_id: current.cohorte_id || cohortItems[0]?.id || '',
      }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible de charger les ressources.')
    } finally { setIsLoading(false) }
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('drive') === 'connected') {
      setNotice('Google Drive est connecté. Vous pouvez maintenant publier vos fichiers.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const filtered = useMemo(
    () => resources.filter(item =>
      (filter === 'Tous' || item.type === filter) && [item.titre, item.description, item.cohorte, item.formation].some(value =>
        String(value ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    ),
    [resources, search, filter],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visibleResources = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount])

  async function create() {
    if (!drive.connected) {
      setError('Connectez d’abord votre compte Google Drive.')
      return
    }
    if (!file) {
      setError('Sélectionnez un fichier à envoyer sur Google Drive.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Le fichier dépasse la limite de 50 Mo.')
      return
    }
    setError('')
    setUploading(true)
    setUploadProgress(0)
    setUploadPhase('upload')
    try {
      await api.uploadFile('/personnel/resources/upload', file, {
        cohorte_id: form.cohorte_id,
        type: form.type,
        titre: form.titre,
        description: form.description,
        publie: form.publie,
      }, (loaded, total) => {
        const progress = Math.min(100, Math.round((loaded / total) * 100))
        setUploadProgress(progress)
        if (progress >= 100) setUploadPhase('drive')
      })
      setShowForm(false)
      setFile(null)
      setNotice('Fichier ajouté à Google Drive et publié pour tous les participants de cette cohorte.')
      setForm(current => ({ ...current, titre: '', description: '' }))
      await load()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible d’ajouter la ressource.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadPhase('upload')
    }
  }

  async function connectDrive() {
    setError('')
    setConnecting(true)
    try {
      const result = await api.get<{ authorization_url: string }>('/personnel/resources/google/authorize')
      window.location.assign(result.authorization_url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible de démarrer la connexion Google.')
      setConnecting(false)
    }
  }

  function selectFile(selected: File | null) {
    setFile(selected)
    setError(selected && selected.size > MAX_FILE_SIZE ? 'Le fichier dépasse la limite de 50 Mo.' : '')
  }

  async function openResource(item: Resource) {
    if (!item.storage_key) return
    if (/^https?:\/\//.test(item.storage_key)) {
      window.open(item.storage_key, '_blank', 'noopener,noreferrer')
      return
    }
    const popup = window.open('', '_blank')
    try {
      const blob = await api.download(`/personnel/resources/${item.id}/download`)
      const url = URL.createObjectURL(blob)
      if (popup) popup.location.href = url
      else window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (openError) {
      popup?.close()
      setError(openError instanceof Error ? openError.message : 'Impossible d’ouvrir la ressource.')
    }
  }

  return <div className="teaching-resources-page">
    <div className="op-page-header teaching-resource-header">
      <div>
        <div className="op-breadcrumb">
          <span>Personnel</span>
          <span className="op-breadcrumb-sep">›</span>
          <span className="op-breadcrumb-active">Ressources</span>
        </div>
        <h1 className="op-page-title">Ressources pédagogiques</h1>
        <p className="op-page-subtitle">Supports associés uniquement à vos cohortes.</p>
      </div>
      <button className="btn-navy teaching-resource-add" onClick={() => setShowForm(true)} disabled={!cohorts.length}>
        <Plus size={17} /> Ajouter une ressource
      </button>
    </div>

    {error && <div className="auth-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}
    {notice && <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#ECFDF5', color: '#047857' }}>{notice}</div>}

    <div className="teaching-resource-toolbar">
      <label><MagnifyingGlass size={19} /><span className="sr-only">Rechercher une ressource</span><input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher une ressource..." /></label>
      <div className="resource-filter"><FunnelSimple size={17} /><select aria-label="Filtrer les ressources" value={filter} onChange={event => { setFilter(event.target.value); setPage(1) }}><option value="Tous">Tous les types</option>{(Object.keys(typeLabels) as ResourceType[]).map(type => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></div>
      <button type="button" className="resource-layout-toggle" aria-pressed={view === 'grid'} onClick={() => { setView(current => current === 'grid' ? 'list' : 'grid'); setPage(1) }}><span aria-hidden="true"><i /></span><SquaresFour size={17} />3 par ligne</button>
    </div>

    {isLoading ? <div className="resource-skeleton-grid">{[0, 1, 2, 3, 4, 5].map(item => <div className="resource-skeleton-card" key={item}><span /><i /><b /><em /></div>)}</div> : <section className={`teaching-resource-grid ${view}`}>
      {filtered.length === 0 && <div className="library-empty"><MagnifyingGlass size={27} /><strong>Aucune ressource trouvée</strong><span>Essayez un autre mot-clé ou un autre filtre.</span></div>}
      {visibleResources.map(item => <article className="resource-card" key={item.id}>
        <TeachingResourceMedia item={item} />
        <div className="resource-card-body">
          <div className="resource-card-labels"><span>{typeLabels[item.type]}</span><span className={`teaching-resource-status ${item.publie ? 'is-published' : 'is-draft'}`}>{item.publie ? 'Publié' : 'Brouillon'}</span></div>
          <h2>{item.titre}</h2>
          <p>{item.description || 'Aucune description ajoutée.'}</p>
          <div className="resource-card-meta"><span>{formatResourceSize(item.taille_octets)}</span><span>{item.cohorte}</span></div>
        </div>
        <div className="library-actions"><button type="button" disabled={!item.storage_key} onClick={() => void openResource(item)}>Consulter <ArrowUpRight size={16} /></button></div>
      </article>)}
    </section>}
    {!isLoading && filtered.length > 0 && <nav className="resource-pagination" aria-label="Pagination des ressources"><span>{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}</span><div><button type="button" disabled={page === 1} onClick={() => setPage(current => current - 1)} aria-label="Page précédente"><CaretLeft size={17} /></button><strong>Page {page} sur {pageCount}</strong><button type="button" disabled={page === pageCount} onClick={() => setPage(current => current + 1)} aria-label="Page suivante"><CaretRight size={17} /></button></div></nav>}

    {showForm && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(9,24,46,.5)' }}>
      <section className="op-card" style={{ width: '100%', maxWidth: 520, padding: 24 }}>
        <div className="row-between">
          <h2 style={{ color: '#0F2347' }}>Nouvelle ressource</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} disabled={uploading}>Fermer</button>
        </div>

        {drive.connected ? <div style={{ marginTop: 16, padding: 11, borderRadius: 8, background: '#ECFDF5', color: '#047857', fontSize: 12, fontWeight: 700 }}>
          Google Drive connecté{drive.account_email ? ` · ${drive.account_email}` : ''}
        </div> : <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>Connecter votre compte Google Drive</strong>
          <p style={{ margin: '5px 0 10px', color: '#64748B', fontSize: 12 }}>
            {drive.configured ? 'EDUOS créera son dossier privé dans votre Mon Drive.' : 'Le client OAuth Google doit d’abord être configuré par l’administrateur.'}
          </p>
          <button className="btn btn-outline btn-sm" onClick={() => void connectDrive()} disabled={!drive.configured || connecting}>
            {connecting ? 'Connexion…' : 'Connecter Google Drive'}
          </button>
        </div>}

        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <label style={{ fontSize: 12, color: '#475569' }}>
            Cohorte
            <select value={form.cohorte_id} onChange={event => setForm(current => ({ ...current, cohorte_id: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }}>
              {cohorts.map(cohort => <option key={cohort.id} value={cohort.id}>{cohort.nom}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: '#475569' }}>
            Type
            <select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value as ResourceType }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }}>
              {(Object.keys(typeLabels) as ResourceType[]).map(type => <option key={type} value={type}>{typeLabels[type]}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: '#475569' }}>
            Titre
            <input value={form.titre} onChange={event => setForm(current => ({ ...current, titre: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: '#475569' }}>
            Description
            <textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} rows={3} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: '#475569' }}>
            Fichier Google Drive
            <input type="file" onChange={event => selectFile(event.target.files?.[0] ?? null)} disabled={!drive.connected || uploading} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff' }} />
            <small style={{ display: 'block', marginTop: 5, color: '#64748B' }}>PDF, document, image, archive, audio ou vidéo - 50 Mo maximum.</small>
            {uploading && <small role="status" style={{ display: 'block', marginTop: 5, color: '#1D4E89', fontWeight: 700 }}>
              {uploadPhase === 'upload' ? `Envoi au serveur : ${uploadProgress}%` : 'Fichier reçu. Enregistrement dans Google Drive…'}
            </small>}
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={uploading}>Annuler</button>
          <button className="btn-navy" onClick={create} disabled={!drive.connected || uploading || !file || file.size > MAX_FILE_SIZE || !form.cohorte_id || form.titre.trim().length < 2}>
            {uploading ? (uploadPhase === 'upload' ? `Envoi ${uploadProgress}%…` : 'Enregistrement…') : 'Publier'}
          </button>
        </div>
      </section>
    </div>}
  </div>
}
