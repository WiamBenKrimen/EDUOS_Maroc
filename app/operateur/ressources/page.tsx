'use client'
import { useState } from 'react'

interface FileItem { name: string; type: 'folder' | 'pdf' | 'video' | 'doc'; size?: string; modified?: string; items?: FileItem[] }

const ROOT_FILES: FileItem[] = [
  {
    name: 'Anglais B1', type: 'folder', modified: '20 juil. 2025', items: [
      { name: 'Cours_01_Introduction.pdf', type: 'pdf', size: '2.4 Mo', modified: '15 juil.' },
      { name: 'Cours_02_Vocabulaire.pdf', type: 'pdf', size: '1.8 Mo', modified: '16 juil.' },
      { name: 'Video_Dialogue_01.mp4', type: 'video', size: '45 Mo', modified: '17 juil.' },
      { name: 'Exercices_Semaine1.pdf', type: 'pdf', size: '890 Ko', modified: '18 juil.' },
    ]
  },
  {
    name: 'Français A2', type: 'folder', modified: '18 juil. 2025', items: [
      { name: 'Grammaire_A2.pdf', type: 'pdf', size: '3.1 Mo', modified: '10 juil.' },
      { name: 'Conjugaison_Exercices.pdf', type: 'pdf', size: '1.2 Mo', modified: '12 juil.' },
    ]
  },
  {
    name: 'Gestion de projet', type: 'folder', modified: '15 juil. 2025', items: [
      { name: 'Introduction_PMI.pdf', type: 'pdf', size: '5.8 Mo', modified: '01 juil.' },
      { name: 'Outils_Gestion.pptx', type: 'doc', size: '12 Mo', modified: '05 juil.' },
    ]
  },
  { name: 'Charte_Centre.pdf', type: 'pdf', size: '340 Ko', modified: '01 jan. 2025' },
  { name: 'Guide_Apprenant.pdf', type: 'pdf', size: '1.1 Mo', modified: '15 jan. 2025' },
]

function FileTypeIcon({ type }: { type: string }) {
  if (type === 'folder') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9922A" strokeWidth="1.5" strokeLinecap="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  )
  if (type === 'pdf') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )
  if (type === 'video') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  )
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

export default function RessourcesPage() {
  const [path, setPath] = useState<string[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const currentFiles = path.length === 0 ? ROOT_FILES : ROOT_FILES.find(f => f.name === path[0])?.items ?? []

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Ressources pédagogiques</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Supports de cours, vidéos et exercices centralisés</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ v: 'grid' as const, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' }, { v: 'list' as const, icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' }].map(b => (
            <button key={b.v} onClick={() => setView(b.v)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E2D9CC', background: view === b.v ? '#1B3A6B' : '#fff', color: view === b.v ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={b.icon}/></svg>
            </button>
          ))}
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.84rem', cursor: 'pointer' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <button onClick={() => setPath([])} style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.82rem', color: path.length > 0 ? '#1B3A6B' : '#1a1823', background: 'transparent', border: 'none', cursor: path.length > 0 ? 'pointer' : 'default', padding: 0 }}>Ressources</button>
        {path.map((p, i) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <button onClick={() => setPath(path.slice(0, i + 1))} style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.82rem', color: '#1a1823', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>{p}</button>
          </div>
        ))}
      </div>

      {/* Files */}
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {currentFiles.map((f, i) => (
            <div key={i} onClick={() => f.type === 'folder' && setPath([f.name])} style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', border: '1px solid #E2D9CC', textAlign: 'center', cursor: f.type === 'folder' ? 'pointer' : 'default', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(-2px)'; t.style.boxShadow = '0 8px 20px rgba(27,58,107,.1)' }}
              onMouseLeave={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(0)'; t.style.boxShadow = 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><FileTypeIcon type={f.type} /></div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.78rem', color: '#1a1823', lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.68rem', color: '#94a3b8' }}>{f.type === 'folder' ? `${f.items?.length ?? 0} fichiers` : f.size}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden' }}>
          {currentFiles.map((f, i) => (
            <div key={i} onClick={() => f.type === 'folder' && setPath([f.name])} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < currentFiles.length - 1 ? '1px solid #f1ede8' : 'none', cursor: f.type === 'folder' ? 'pointer' : 'default', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <FileTypeIcon type={f.type} />
              <span style={{ flex: 1, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.88rem', color: '#1a1823' }}>{f.name}</span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8', width: 100, textAlign: 'right' }}>{f.type === 'folder' ? `${f.items?.length ?? 0} éléments` : f.size}</span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8', width: 100, textAlign: 'right' }}>{f.modified}</span>
              {f.type !== 'folder' && <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#1B3A6B', cursor: 'pointer' }}>Télécharger</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
