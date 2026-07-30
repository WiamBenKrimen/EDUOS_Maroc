'use client'
import { useEffect, useState } from 'react'
import SearchFilterBar from '../search-filter-bar'
import { api } from '../../../lib/api-client'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const INITIAL_PROSPECTS = [
  { id: 1, nom: 'Yasmine Ait Ouali', formation: 'Anglais B1', contact: '14 juil. 2025', telephone: '06 61 12 34 56', email: 'y.aitouali@gmail.com', statut: 'Nouveau', color: '#0284C7', bg: '#EBF5FF' },
  { id: 2, nom: 'Mehdi Bensouda', formation: 'Espagnol débutant', contact: '12 juil. 2025', telephone: '06 62 45 67 89', email: 'm.bensouda@gmail.com', statut: 'En cours', color: GOLD, bg: '#FEF3C7' },
  { id: 3, nom: 'Nour El Houda Fassi', formation: 'Français B2', contact: '10 juil. 2025', telephone: '06 63 78 90 12', email: 'n.fassi@gmail.com', statut: 'Inscrit', color: '#059669', bg: '#ECFDF5' },
  { id: 4, nom: 'Amine Rachidi', formation: 'Gestion de projet', contact: '08 juil. 2025', telephone: '06 64 23 45 67', email: 'a.rachidi@gmail.com', statut: 'En cours', color: GOLD, bg: '#FEF3C7' },
  { id: 5, nom: 'Sara El Ouafi', formation: 'Marketing digital', contact: '05 juil. 2025', telephone: '06 65 56 78 90', email: 's.ouafi@gmail.com', statut: 'Inscrit', color: '#059669', bg: '#ECFDF5' },
  { id: 6, nom: 'Khalid Mansouri', formation: 'Comptabilité', contact: '02 juil. 2025', telephone: '06 66 89 01 23', email: 'k.mansouri@gmail.com', statut: 'Perdu', color: '#DC2626', bg: '#FEE2E2' },
  { id: 7, nom: 'Fatima Benali', formation: 'Anglais C1', contact: '28 juin 2025', telephone: '06 67 90 12 34', email: 'f.benali@gmail.com', statut: 'Nouveau', color: '#0284C7', bg: '#EBF5FF' },
  { id: 8, nom: 'Omar Tahiri', formation: 'Informatique bureautique', contact: '25 juin 2025', telephone: '06 68 01 23 45', email: 'o.tahiri@gmail.com', statut: 'En cours', color: GOLD, bg: '#FEF3C7' },
]

function mapProspect(item: any) {
  const styles: Record<string, [string, string, string]> = {
    nouveau: ['Nouveau', '#0284C7', '#EBF5FF'], en_cours: ['En cours', GOLD, '#FEF3C7'],
    inscrit: ['Inscrit', '#059669', '#ECFDF5'], perdu: ['Perdu', '#DC2626', '#FEE2E2'],
  }
  const [statut, color, bg] = styles[item.statut] ?? styles.nouveau
  return { id: item.id, nom: item.nom_complet, formation: item.formation_souhaitee ?? 'Non précisée', contact: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(item.created_at)), telephone: item.telephone ?? '—', email: item.email ?? '—', statut, color, bg }
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Tous')
  const [toast, setToast] = useState<string | null>(null)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewProspect, setViewProspect] = useState<any | null>(null)

  // Form State
  const [newNom, setNewNom] = useState('')
  const [newFormation, setNewFormation] = useState('Anglais B1')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function loadProspects() {
    try { setLoading(true); setProspects((await api.get<any[]>('/director/prospects')).map(mapProspect)) }
    catch (error) { triggerToast(error instanceof Error ? error.message : 'Impossible de charger les prospects.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadProspects() }, [])

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await api.post<any>('/director/prospects', { nom_complet: newNom, formation_souhaitee: newFormation, telephone: newPhone || null, email: newEmail || null })
      setProspects(current => [mapProspect(created), ...current])
      setShowAddModal(false); triggerToast(`Prospect "${newNom}" ajouté avec succès !`)
      setNewNom(''); setNewPhone(''); setNewEmail('')
    } catch (error) { triggerToast(error instanceof Error ? error.message : 'Création impossible.') }
  }

  const convertToEnrollment = async (id: string, nom: string) => {
    try {
      const updated = await api.patch<any>(`/director/prospects/${id}/statut`, { statut: 'inscrit' })
      setProspects(prev => prev.map(p => p.id === id ? mapProspect(updated) : p))
      triggerToast(`Prospect "${nom}" converti en élève inscrit !`)
    } catch (error) { triggerToast(error instanceof Error ? error.message : 'Mise à jour impossible.') }
  }

  const filtered = prospects.filter(p => {
    const matchStatus = selectedStatus === 'Tous' || p.statut === selectedStatus
    const matchSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.formation.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

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

      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Suivi des Prospects</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Gérez le pipeline commercial et convertissez vos demandes en inscriptions d'élèves.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 9,
            border: 'none',
            background: BLUE,
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(27,58,107,0.2)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau prospect
        </button>
      </div>

      <SearchFilterBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher par nom ou formation..."
        resultCount={filtered.length}
        filters={[{ label: 'Statut', value: selectedStatus, options: ['Tous', 'Nouveau', 'En cours', 'Inscrit', 'Perdu'], onChange: setSelectedStatus }]}
      />

      {/* Prospects Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,35,71,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Prospect', 'Formation souhaitée', 'Date de contact', 'Coordonnées', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.nom.charAt(0)}
                    </div>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.88rem', color: NAVY }}>{p.nom}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '.85rem', color: '#334155', fontWeight: 600 }}>{p.formation}</td>
                <td style={{ padding: '14px 20px', fontSize: '.82rem', color: '#64748b' }}>{p.contact}</td>
                <td style={{ padding: '14px 20px', fontSize: '.82rem', color: '#64748b' }}>
                  <div>{p.telephone}</div>
                  <div style={{ fontSize: '.75rem', color: '#94A3B8' }}>{p.email}</div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: p.color, background: p.bg, padding: '4px 10px', borderRadius: 99, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {p.statut}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setViewProspect(p)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #CBD5E1', background: '#fff', fontSize: '.78rem', fontWeight: 700, color: NAVY, cursor: 'pointer' }}
                    >
                      Détails
                    </button>

                    {p.statut !== 'Inscrit' && (
                      <button
                        onClick={() => convertToEnrollment(p.id, p.nom)}
                        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#059669', fontSize: '.78rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                      >
                        Inscrire
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
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
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Ajouter un nouveau prospect</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddProspect} style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Nom complet</label>
                <input
                  type="text"
                  placeholder="Ex: Yasmine El Amrani"
                  value={newNom}
                  onChange={e => setNewNom(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Formation souhaitée</label>
                <select
                  value={newFormation}
                  onChange={e => setNewFormation(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                >
                  <option value="Anglais B1">Anglais B1 Intermédiaire</option>
                  <option value="Anglais B2">Anglais B2 Avancé</option>
                  <option value="Français B2">Français B2 Professionnel</option>
                  <option value="Espagnol débutant">Espagnol Débutant</option>
                  <option value="Management">Management de projet</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Téléphone</label>
                  <input
                    type="text"
                    placeholder="06 61 00 00 00"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    placeholder="nom@email.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Ajouter le prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prospect Details Modal */}
      {viewProspect && (
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
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Fiche Prospect</h3>
              <button onClick={() => setViewProspect(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F1F5F9', color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {viewProspect.nom.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: NAVY, margin: 0 }}>{viewProspect.nom}</h4>
                  <span style={{ fontSize: 12, color: viewProspect.color, fontWeight: 700 }}>{viewProspect.statut}</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12.5, color: '#475569' }}><strong>Formation :</strong> {viewProspect.formation}</div>
                <div style={{ fontSize: 12.5, color: '#475569' }}><strong>Téléphone :</strong> {viewProspect.telephone}</div>
                <div style={{ fontSize: 12.5, color: '#475569' }}><strong>Email :</strong> {viewProspect.email}</div>
                <div style={{ fontSize: 12.5, color: '#475569' }}><strong>Date 1er Contact :</strong> {viewProspect.contact}</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    triggerToast(`Appel vers ${viewProspect.telephone} initialisé...`)
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  📞 Appeler
                </button>
                <button
                  onClick={() => {
                    convertToEnrollment(viewProspect.id, viewProspect.nom)
                    setViewProspect(null)
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}
                >
                  Inscrire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
