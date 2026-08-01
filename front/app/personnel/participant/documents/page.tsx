'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api-client'
import { formatBytes, type ParticipantDocument } from '@/lib/participant-types'

const labels: Record<string, string> = { attestation: 'Attestation', certificat: 'Certificat', recu: 'Reçu', facture: 'Facture', contrat: 'Contrat', programme: 'Programme', autre: 'Autre' }

export default function DocumentsPage() {
  const [items, setItems] = useState<ParticipantDocument[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [preview, setPreview] = useState<ParticipantDocument | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { api.get<ParticipantDocument[]>('/participant/documents').then(setItems).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger les documents.')) }, [])
  const filtered = useMemo(() => items.filter(item => (filter === 'Tous' || labels[item.type] === filter) && `${item.nom} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [items, filter, query])

  async function accessDocument(item: ParticipantDocument) {
    if (/^https?:\/\//.test(item.storage_key)) { window.open(item.storage_key, '_blank', 'noopener,noreferrer'); return }
    await navigator.clipboard.writeText(item.storage_key)
    setNotice('La référence de stockage a été copiée. Le téléchargement public dépend du service de fichiers du centre.')
  }

  return <div className="library-page">
    <header className="library-header"><div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Documents</span></div><h1>Mes documents</h1><p>Documents visibles associés à votre dossier.</p></div><span>{items.length} fichier{items.length > 1 ? 's' : ''}</span></header>
    {error && <div className="auth-error" role="alert">{error}</div>}{notice && <div className="part-toast"><span>✓</span>{notice}</div>}
    <div className="library-toolbar"><label><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un document…" /></label><select value={filter} onChange={event => setFilter(event.target.value)}><option>Tous</option>{Array.from(new Set(items.map(item => labels[item.type] ?? item.type))).map(type => <option key={type}>{type}</option>)}</select><div className="library-view"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Grille</button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button></div></div>
    <div className={`library-items document-items ${view}`}>{filtered.map(item => <article key={item.id}><div className="document-card-top"><span className="library-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg></span><span className="document-badge">{labels[item.type] ?? item.type}</span></div><div className="document-card-copy"><h2>{item.nom}</h2><p>{new Date(item.created_at).toLocaleDateString('fr-FR')} · {formatBytes(item.taille_octets)}</p></div><div className="library-actions"><button onClick={() => setPreview(item)}>Aperçu</button><button onClick={() => void accessDocument(item)}>Accéder au fichier</button></div></article>)}{!filtered.length && <div className="library-empty">Aucun document trouvé.</div>}</div>
    {preview && <div className="library-overlay" onMouseDown={event => event.target === event.currentTarget && setPreview(null)}><div className="library-preview"><header><span>APERÇU DU DOCUMENT</span><button onClick={() => setPreview(null)}>×</button></header><div className="library-preview-paper"><strong>EDUOS</strong><span>DOCUMENT OFFICIEL</span><h2>{preview.nom}</h2><p>{labels[preview.type] ?? preview.type} · {new Date(preview.created_at).toLocaleDateString('fr-FR')}</p><i>{preview.genere_automatiquement ? 'Document généré automatiquement' : 'Document vérifié'}</i></div><button onClick={() => void accessDocument(preview)}>Accéder au fichier</button></div></div>}
  </div>
}
