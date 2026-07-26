'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'

const DOCUMENTS = [
  { id: 1, nom: 'Attestation_Formation_B1.pdf', type: 'Attestation', date: '30 juin 2025', taille: '280 Ko', color: '#7C3AED', tag: 'Attestation' },
  { id: 2, nom: 'Certificat_Presence_Juin.pdf', type: 'Certificat de présence', date: '30 juin 2025', taille: '190 Ko', color: '#059669', tag: 'Certificats' },
  { id: 3, nom: 'Recu_Paiement_Juin.pdf', type: 'Reçu de paiement', date: '20 juin 2025', taille: '95 Ko', color: '#D97706', tag: 'Reçus' },
  { id: 4, nom: 'Recu_Paiement_Mai.pdf', type: 'Reçu de paiement', date: '18 mai 2025', taille: '95 Ko', color: '#D97706', tag: 'Reçus' },
  { id: 5, nom: 'Contrat_Formation_2025.pdf', type: 'Contrat d\'engagement', date: '01 janv. 2025', taille: '340 Ko', color: '#1B3A6B', tag: 'Contrats' },
  { id: 6, nom: 'Fiche_Inscription_Benali.pdf', type: 'Fiche d\'inscription', date: '01 janv. 2025', taille: '210 Ko', color: '#64748b', tag: 'Autres' },
]

const CATEGORIES = ['Tous', 'Attestations', 'Certificats', 'Reçus', 'Contrats']

export default function ParticipantDocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewDoc, setPreviewDoc] = useState<typeof DOCUMENTS[0] | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDownload = (doc: typeof DOCUMENTS[0]) => {
    const textContent = `EDUOS MAROC - DOCUMENT OFFICIEL\n` +
      `========================================\n` +
      `Document: ${doc.nom}\n` +
      `Type: ${doc.type}\n` +
      `Date de délivrance: ${doc.date}\n` +
      `Apprenant: Yasmine Benali (ID: EDU-2025-884)\n` +
      `Organisme d'Éducation: EDUOS MAROC - Centre de Rabat Hassan\n` +
      `========================================\n` +
      `Document certifié et conforme.`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.nom
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Téléchargement de "${doc.nom}" lancé !`)
  }

  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesCategory = selectedCategory === 'Tous' || doc.tag === selectedCategory
    const matchesSearch = doc.nom.toLowerCase().includes(searchQuery.toLowerCase()) || doc.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      {/* Toast Notification */}
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Mes documents</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Retrouvez et téléchargez l'ensemble de vos pièces justificatives, attestations et reçus.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 99,
                border: selectedCategory === cat ? 'none' : '1px solid #E2E8F0',
                background: selectedCategory === cat ? NAVY : '#fff',
                color: selectedCategory === cat ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: selectedCategory === cat ? 700 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 260 }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 9,
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#fff'
            }}
          />
        </div>
      </div>

      {/* Grid of Documents */}
      {filteredDocs.length === 0 ? (
        <div style={{ padding: 48, background: '#fff', borderRadius: 14, textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Aucun document ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {filteredDocs.map((d) => (
            <div
              key={d.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 22,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(15,35,71,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${d.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="1.8" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
                    </svg>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, color: d.color, background: `${d.color}12`, padding: '3px 9px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {d.tag}
                  </span>
                </div>

                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: NAVY, marginBottom: 4, lineHeight: 1.35 }}>
                  {d.nom}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 18 }}>
                  {d.type} · {d.date} · {d.taille}
                </div>
              </div>

              {/* Card Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={() => setPreviewDoc(d)}
                  style={{
                    padding: '8px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: NAVY,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Aperçu
                </button>
                <button
                  onClick={() => handleDownload(d)}
                  style={{
                    padding: '8px',
                    borderRadius: 8,
                    border: 'none',
                    background: BLUE,
                    color: '#fff',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 35, 71, 0.6)',
          backdropFilter: 'blur(4px)',
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
            maxWidth: 500,
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Aperçu du document</h3>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>{previewDoc.nom}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px dashed #CBD5E1', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: `${previewDoc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={previewDoc.color} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: NAVY }}>{previewDoc.nom}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Délivré le {previewDoc.date} · Taille {previewDoc.taille}</div>
                <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700, marginTop: 8 }}>Document officiel vérifié & signé électroniquement</div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setPreviewDoc(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewDoc)
                    setPreviewDoc(null)
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: BLUE, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Télécharger le PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
