'use client'

import { useState } from 'react'

const INITIAL_DOCS = [
  { id: 1, nom: 'Contrat_Ahmed_Cherkaoui.pdf', type: 'Contrat', apprenant: 'Ahmed Cherkaoui', date: '01 sept. 2024', taille: '340 Ko' },
  { id: 2, nom: 'Attestation_Sara_Benali.pdf', type: 'Attestation', apprenant: 'Sara Benali', date: '30 juin 2025', taille: '280 Ko' },
  { id: 3, nom: 'Fiche_Inscription_Fatima.pdf', type: "Fiche d'inscription", apprenant: 'Fatima Zahra El Idrissi', date: '15 sept. 2024', taille: '190 Ko' },
  { id: 4, nom: 'Reglement_Interieur_2025.pdf', type: 'Règlement', apprenant: '—', date: '01 jan. 2025', taille: '450 Ko' },
  { id: 5, nom: 'Contrat_Karim_Ouali.pdf', type: 'Contrat', apprenant: 'Karim Ouali', date: '01 oct. 2024', taille: '340 Ko' },
  { id: 6, nom: 'Photo_ID_Omar_Tahiri.jpg', type: "Pièce d'identité", apprenant: 'Omar Tahiri', date: '10 oct. 2024', taille: '1.2 Mo' },
]

export default function DocumentsPage() {
  const [docs, setDocs] = useState(INITIAL_DOCS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Tous les types')
  const [showImportModal, setShowImportModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<typeof INITIAL_DOCS[0] | null>(null)
  const [toastMessage, setToastMessage] = useState('')

  // New Doc Form
  const [newDoc, setNewDoc] = useState({
    nom: 'Nouveau_Document.pdf',
    type: 'Contrat',
    apprenant: 'Ahmed Cherkaoui',
    taille: '420 Ko'
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleImportDoc = () => {
    const created = {
      id: Date.now(),
      nom: newDoc.nom,
      type: newDoc.type,
      apprenant: newDoc.apprenant,
      date: 'Aujourd\'hui',
      taille: newDoc.taille
    }
    setDocs(prev => [created, ...prev])
    setShowImportModal(false)
    triggerToast(`Document "${created.nom}" importé avec succès !`)
  }

  const handleDeleteDoc = (id: number) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    triggerToast('Document supprimé.')
  }

  const filtered = docs.filter(d => {
    const matchSearch = d.nom.toLowerCase().includes(search.toLowerCase()) || d.apprenant.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'Tous les types' || d.type === categoryFilter
    return matchSearch && matchCategory
  })

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
            <span style={{ color: '#1B3A6B' }}>Documents</span>
          </div>
          <h1 className="page-title">Documents administratifs</h1>
          <p className="page-subtitle">Gestion des contrats, attestations et pièces justificatives</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowImportModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importer un document
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card card-p" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Rechercher un document ou apprenant…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select className="search-input" style={{ width: 170, paddingLeft: 10 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option>Tous les types</option>
            <option>Contrat</option>
            <option>Attestation</option>
            <option>Fiche d'inscription</option>
            <option>Règlement</option>
            <option>Pièce d'identité</option>
          </select>

          <span className="card-meta" style={{ marginLeft: 'auto' }}>{filtered.length} document{filtered.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Apprenant</th>
                <th>Date</th>
                <th>Taille</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600, color: '#1a2535' }}>
                    <div className="row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {d.nom}
                    </div>
                  </td>
                  <td><span className="badge badge-navy">{d.type}</span></td>
                  <td style={{ color: '#5A6B7D' }}>{d.apprenant}</td>
                  <td style={{ color: '#9AABBC', fontSize: '.78rem' }}>{d.date}</td>
                  <td style={{ color: '#9AABBC', fontSize: '.78rem' }}>{d.taille}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '.72rem' }} onClick={() => setPreviewDoc(d)}>
                        Voir
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '.72rem' }} onClick={() => triggerToast(`Téléchargement de "${d.nom}"…`)}>
                        Télécharger
                      </button>
                      <button className="btn btn-sm" style={{ padding: '4px 8px', fontSize: '.72rem', background: 'rgba(220,38,38,.08)', color: '#DC2626', border: 'none' }} onClick={() => handleDeleteDoc(d.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 440 }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 className="card-title">Importer un document</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowImportModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Nom du document</label>
                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newDoc.nom} onChange={e => setNewDoc(prev => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div className="section-grid-2">
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Type de document</label>
                  <select className="search-input" style={{ width: '100%', paddingLeft: 10 }} value={newDoc.type} onChange={e => setNewDoc(prev => ({ ...prev, type: e.target.value }))}>
                    <option>Contrat</option>
                    <option>Attestation</option>
                    <option>Fiche d'inscription</option>
                    <option>Règlement</option>
                    <option>Pièce d'identité</option>
                  </select>
                </div>
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Apprenant concerné</label>
                  <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newDoc.apprenant} onChange={e => setNewDoc(prev => ({ ...prev, apprenant: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowImportModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={handleImportDoc}>Valider et importer</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
            <div className="avatar avatar-md avatar-navy" style={{ width: 44, height: 44, margin: '0 auto 12px' }}>
              📄
            </div>
            <h2 className="page-title" style={{ fontSize: '1.15rem', marginBottom: 4 }}>{previewDoc.nom}</h2>
            <p className="card-meta" style={{ marginBottom: 16 }}>{previewDoc.type} · Apprenant: {previewDoc.apprenant} · {previewDoc.taille}</p>

            <div style={{ background: '#F8F9FB', borderRadius: 8, padding: '14px', marginBottom: 16, fontSize: '.78rem', color: '#5A6B7D' }}>
              Document numérisé enregistré le {previewDoc.date} dans le système EDUOS.
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setPreviewDoc(null)}>Fermer</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => triggerToast(`Téléchargement de ${previewDoc.nom}…`)}>Télécharger PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
