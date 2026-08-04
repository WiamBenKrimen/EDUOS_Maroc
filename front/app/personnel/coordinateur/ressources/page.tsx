'use client'

import { useState } from 'react'

interface FileItem { id: number; name: string; type: 'folder' | 'pdf' | 'video' | 'doc'; size?: string; modified?: string; items?: FileItem[] }

const INITIAL_ROOT_FILES: FileItem[] = [
  {
    id: 1, name: 'Anglais B1', type: 'folder', modified: '20 juil. 2025', items: [
      { id: 101, name: 'Cours_01_Introduction.pdf', type: 'pdf', size: '2.4 Mo', modified: '15 juil.' },
      { id: 102, name: 'Cours_02_Vocabulaire.pdf', type: 'pdf', size: '1.8 Mo', modified: '16 juil.' },
      { id: 103, name: 'Video_Dialogue_01.mp4', type: 'video', size: '45 Mo', modified: '17 juil.' },
      { id: 104, name: 'Exercices_Semaine1.pdf', type: 'pdf', size: '890 Ko', modified: '18 juil.' },
    ]
  },
  {
    id: 2, name: 'Français A2', type: 'folder', modified: '18 juil. 2025', items: [
      { id: 201, name: 'Grammaire_A2.pdf', type: 'pdf', size: '3.1 Mo', modified: '10 juil.' },
      { id: 202, name: 'Conjugaison_Exercices.pdf', type: 'pdf', size: '1.2 Mo', modified: '12 juil.' },
    ]
  },
  {
    id: 3, name: 'Gestion de projet', type: 'folder', modified: '15 juil. 2025', items: [
      { id: 301, name: 'Introduction_PMI.pdf', type: 'pdf', size: '5.8 Mo', modified: '01 juil.' },
      { id: 302, name: 'Outils_Gestion.pptx', type: 'doc', size: '12 Mo', modified: '05 juil.' },
    ]
  },
  { id: 4, name: 'Charte_Centre.pdf', type: 'pdf', size: '340 Ko', modified: '01 jan. 2025' },
  { id: 5, name: 'Guide_Apprenant.pdf', type: 'pdf', size: '1.1 Mo', modified: '15 jan. 2025' },
]

function FileTypeIcon({ type }: { type: string }) {
  if (type === 'folder') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9922A" strokeWidth="1.5" strokeLinecap="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  )
  if (type === 'pdf') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )
  if (type === 'video') return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  )
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

export default function RessourcesPage() {
  const [rootFiles, setRootFiles] = useState<FileItem[]>(INITIAL_ROOT_FILES)
  const [path, setPath] = useState<string[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [newFile, setNewFile] = useState({
    name: 'Nouveau_Support_Cours.pdf',
    type: 'pdf' as 'pdf' | 'video' | 'doc' | 'folder',
    size: '2.5 Mo'
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const currentFolder = path.length === 0 ? null : rootFiles.find(f => f.name === path[0])
  const rawFiles = path.length === 0 ? rootFiles : currentFolder?.items ?? []

  const currentFiles = rawFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const handleAddResource = () => {
    const created: FileItem = {
      id: Date.now(),
      name: newFile.name,
      type: newFile.type,
      size: newFile.size,
      modified: 'Aujourd\'hui'
    }

    if (path.length === 0) {
      setRootFiles(prev => [...prev, created])
    } else {
      setRootFiles(prev => prev.map(f => {
        if (f.name === path[0]) {
          return { ...f, items: [...(f.items ?? []), created] }
        }
        return f
      }))
    }

    setShowAddModal(false)
    triggerToast(`Ressource "${created.name}" ajoutée !`)
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
            <span style={{ color: '#1B3A6B' }}>Ressources</span>
          </div>
          <h1 className="page-title">Ressources pédagogiques</h1>
          <p className="page-subtitle">Supports de cours, vidéos et exercices centralisés</p>
        </div>

        <div className="page-header-actions">
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Rechercher une ressource…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #E8ECF2', borderRadius: 9, padding: 3 }}>
            <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('grid')} style={{ padding: '4px 8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')} style={{ padding: '4px 8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter une ressource
          </button>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="card card-p" style={{ padding: '12px 18px', marginBottom: 20 }}>
        <div className="row" style={{ gap: 8 }}>
          <button onClick={() => setPath([])} className="btn btn-ghost btn-sm" style={{ color: path.length === 0 ? '#1B3A6B' : '#7A8CA0', fontWeight: 700 }}>
            📁 Racine
          </button>
          {path.map((p, i) => (
            <div key={p} className="row" style={{ gap: 8 }}>
              <span style={{ color: '#C8D0DC' }}>›</span>
              <button onClick={() => setPath(path.slice(0, i + 1))} className="btn btn-ghost btn-sm" style={{ color: '#1B3A6B', fontWeight: 700 }}>
                {p}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Files Display */}
      {view === 'grid' ? (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {currentFiles.map((f) => (
            <div
              key={f.id}
              onClick={() => f.type === 'folder' && setPath([f.name])}
              className="card card-p"
              style={{ textAlign: 'center', cursor: f.type === 'folder' ? 'pointer' : 'default', transition: 'transform .15s, box-shadow .15s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <FileTypeIcon type={f.type} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.84rem', color: '#1a2535', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name}
              </div>
              <div className="card-meta">
                {f.type === 'folder' ? `${f.items?.length ?? 0} éléments` : `${f.size} · ${f.modified}`}
              </div>

              {f.type !== 'folder' && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => triggerToast(`Téléchargement de "${f.name}" démarré…`)}>
                  Télécharger
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Dernière modification</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentFiles.map(f => (
                <tr key={f.id} style={{ cursor: f.type === 'folder' ? 'pointer' : 'default' }} onClick={() => f.type === 'folder' && setPath([f.name])}>
                  <td>
                    <div className="row">
                      <FileTypeIcon type={f.type} />
                      <span style={{ fontWeight: 600, color: '#1a2535' }}>{f.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{f.type.toUpperCase()}</span></td>
                  <td style={{ color: '#7A8CA0' }}>{f.type === 'folder' ? `${f.items?.length ?? 0} éléments` : f.size}</td>
                  <td style={{ color: '#9AABBC' }}>{f.modified}</td>
                  <td>
                    {f.type !== 'folder' && (
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); triggerToast(`Téléchargement de "${f.name}"…`); }}>
                        Télécharger
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 440 }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 className="card-title">Ajouter une ressource</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Nom du fichier</label>
                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newFile.name} onChange={e => setNewFile(prev => ({ ...prev, name: e.target.value }))} />
              </div>

              <div className="section-grid-2">
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Type</label>
                  <select className="search-input" style={{ width: '100%', paddingLeft: 10 }} value={newFile.type} onChange={e => setNewFile(prev => ({ ...prev, type: e.target.value as any }))}>
                    <option value="pdf">PDF Document</option>
                    <option value="video">Vidéo MP4</option>
                    <option value="doc">Document Word/PPT</option>
                    <option value="folder">Dossier</option>
                  </select>
                </div>
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Taille estimée</label>
                  <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newFile.size} onChange={e => setNewFile(prev => ({ ...prev, size: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddResource}>Ajouter la ressource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
