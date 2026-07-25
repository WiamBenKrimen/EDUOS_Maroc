'use client'
import { useState } from 'react'

const DOCS = [
  { nom: 'Contrat_Ahmed_Cherkaoui.pdf', type: 'Contrat', apprenant: 'Ahmed Cherkaoui', date: '01 sept. 2024', taille: '340 Ko' },
  { nom: 'Attestation_Sara_Benali.pdf', type: 'Attestation', apprenant: 'Sara Benali', date: '30 juin 2025', taille: '280 Ko' },
  { nom: 'Fiche_Inscription_Fatima.pdf', type: "Fiche d'inscription", apprenant: 'Fatima Zahra El Idrissi', date: '15 sept. 2024', taille: '190 Ko' },
  { nom: 'Reglement_Interieur_2025.pdf', type: 'Règlement', apprenant: '—', date: '01 jan. 2025', taille: '450 Ko' },
  { nom: 'Contrat_Karim_Ouali.pdf', type: 'Contrat', apprenant: 'Karim Ouali', date: '01 oct. 2024', taille: '340 Ko' },
  { nom: 'Photo_ID_Omar_Tahiri.jpg', type: 'Pièce d\'identité', apprenant: 'Omar Tahiri', date: '10 oct. 2024', taille: '1.2 Mo' },
]

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  'Contrat': { color: '#1B3A6B', bg: 'rgba(27,58,107,.07)' },
  'Attestation': { color: '#059669', bg: 'rgba(5,150,105,.07)' },
  "Fiche d'inscription": { color: '#C9922A', bg: 'rgba(201,146,42,.09)' },
  'Règlement': { color: '#64748b', bg: '#f1f5f9' },
  "Pièce d'identité": { color: '#7C3AED', bg: 'rgba(124,58,237,.07)' },
}

export default function DocumentsPage() {
  const [dragging, setDragging] = useState(false)

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Documents</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Gérez les documents administratifs des apprenants</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importer un document
          <input type="file" style={{ display: 'none' }} />
        </label>
      </div>

      {/* Drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false) }}
        style={{ border: `2px dashed ${dragging ? '#1B3A6B' : '#E2D9CC'}`, borderRadius: 16, padding: '32px', textAlign: 'center', background: dragging ? 'rgba(27,58,107,.04)' : '#faf8f5', marginBottom: 28, transition: 'all .2s' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#1B3A6B' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.9rem', color: dragging ? '#1B3A6B' : '#374151', marginBottom: 6 }}>
          {dragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos documents ici'}
        </p>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.8rem', color: '#94a3b8' }}>PDF, images, Word — Taille maximale 20 Mo par fichier</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder="Rechercher un document…" style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', outline: 'none', width: 280, background: '#fff' }} />
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option>Tous les types</option>
          <option>Contrat</option>
          <option>Attestation</option>
          <option>Fiche d'inscription</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['Document', 'Type', 'Apprenant', 'Date', 'Taille', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCS.map((d, i) => {
              const tc = TYPE_COLORS[d.type] ?? { color: '#64748b', bg: '#f1f5f9' }
              return (
                <tr key={i} style={{ borderBottom: i < DOCS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.86rem', color: '#1a1823' }}>{d.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px' }}><span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 99, background: tc.bg, color: tc.color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.7rem' }}>{d.type}</span></td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b' }}>{d.apprenant}</td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b' }}>{d.date}</td>
                  <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#94a3b8' }}>{d.taille}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#1B3A6B', cursor: 'pointer' }}>Voir</button>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#64748b', cursor: 'pointer' }}>Télécharger</button>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#DC2626', cursor: 'pointer' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
