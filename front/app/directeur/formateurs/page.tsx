'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import SearchFilterBar from '../search-filter-bar'
import { createAccount, type PersonnelFonction } from '../../../lib/auth'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const INITIAL_FORMATEURS = [
  { id: 1, nom: 'Karim Alaoui', role: 'Formateur', specialite: 'Langues — Anglais B1 / B2', groupes: 3, sessions: 24, taux: 120, note: 4.8, email: 'k.alaoui@eduos.ma', tel: '06 61 22 33 44' },
  { id: 2, nom: 'Laila Bennouna', role: 'Enseignant', specialite: 'Langues — Français A2 / B2', groupes: 2, sessions: 18, taux: 110, note: 4.9, email: 'l.bennouna@eduos.ma', tel: '06 62 33 44 55' },
  { id: 3, nom: 'Omar El Fassi', role: 'Commercial', specialite: 'Développement commercial', groupes: 0, sessions: 0, taux: 0, note: 4.7, email: 'o.elfassi@eduos.ma', tel: '06 63 44 55 66' },
  { id: 4, nom: 'Sanae Tahiri', role: 'Coordinateur', specialite: 'Gestion pédagogique', groupes: 4, sessions: 0, taux: 0, note: 4.6, email: 's.tahiri@eduos.ma', tel: '06 64 55 66 77' },
  { id: 5, nom: 'Youssef Chraibi', role: 'Formateur', specialite: 'Marketing digital & Social Media', groupes: 1, sessions: 10, taux: 115, note: 4.5, email: 'y.chraibi@eduos.ma', tel: '06 65 66 77 88' },
  { id: 6, nom: 'Nadia Rami', role: 'Enseignant', specialite: 'Anglais intensif & TOEFL', groupes: 2, sessions: 20, taux: 140, note: 5.0, email: 'n.rami@eduos.ma', tel: '06 66 77 88 99' },
]

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.floor(n) ? GOLD : '#CBD5E1'}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: '.76rem', color: NAVY, fontWeight: 800, marginLeft: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{n.toFixed(1)}</span>
    </div>
  )
}

export default function FormateursPage() {
  const coordinatorMode = usePathname().startsWith('/personnel/coordinateur')
  const [formateurs, setFormateurs] = useState(INITIAL_FORMATEURS)
  const [toast, setToast] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFormateur, setSelectedFormateur] = useState<typeof INITIAL_FORMATEURS[0] | null>(null)

  // Add form state
  const [newNom, setNewNom] = useState('')
  const [newSpec, setNewSpec] = useState('')
  const [newTaux, setNewTaux] = useState(120)
  const [newRole, setNewRole] = useState<PersonnelFonction>('formateur')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('Bienvenue2026!')
  const [formError, setFormError] = useState('')

  const filtered = formateurs.filter(f =>
    (!coordinatorMode || f.role === 'Formateur' || f.role === 'Enseignant') &&
    (
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialite.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddFormateur = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const roleLabel = newRole.charAt(0).toUpperCase() + newRole.slice(1)
    const newEntry = {
      id: Date.now(),
      nom: newNom,
      role: roleLabel,
      specialite: newSpec || 'Général',
      groupes: newRole === 'commercial' ? 0 : 1,
      sessions: 0,
      taux: Number(newTaux) || 120,
      note: 5.0,
      email: newEmail,
      tel: '06 60 00 00 00'
    }
    try {
      createAccount({ nom: newNom, email: newEmail, password: newPassword, role: 'personnel', personnelFonction: newRole })
      setFormateurs([newEntry, ...formateurs])
      setShowAddModal(false)
      triggerToast(`${roleLabel} "${newNom}" ajouté et compte créé avec succès !`)
      setNewNom('')
      setNewSpec('')
      setNewEmail('')
      setNewPassword('Bienvenue2026!')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Impossible de créer le compte.')
    }
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>{coordinatorMode ? 'Enseignants & Formateurs' : 'Personnel du centre'}</h1>
            <p style={{ fontSize: 13.5, color: '#64748b' }}>{coordinatorMode ? 'Ajoutez les enseignants et formateurs, puis créez leurs accès à la plateforme.' : 'Gérez les coordinateurs, commerciaux, formateurs et enseignants ainsi que leurs accès.'}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => triggerToast('Dossiers de rémunération téléchargés !')}
            style={{
              padding: '10px 16px',
              borderRadius: 9,
              border: '1px solid #CBD5E1',
              background: '#fff',
              color: NAVY,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Bilan Rémunérations
          </button>
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
            Ajouter un membre
          </button>
          </div>
        </div>
        <SearchFilterBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher un membre, un rôle ou une spécialité..." resultCount={filtered.length} />
      </div>

      {/* Grid of Trainers */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p style={{ fontSize: 14, margin: '8px 0' }}>Aucun membre trouvé</p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {filtered.map((f) => (
          <div
            key={f.id}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 22,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(15,35,71,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                  {f.nom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.95rem', color: NAVY, marginBottom: 2 }}>{f.nom}</div>
                  <div style={{ display: 'inline-block', marginBottom: 3, padding: '2px 7px', borderRadius: 20, background: '#EBF0FA', color: BLUE, fontSize: '.62rem', fontWeight: 800 }}>{f.role}</div>
                  <div style={{ fontSize: '.75rem', color: '#64748b', lineHeight: 1.3 }}>{f.specialite}</div>
                </div>
              </div>

              <Stars n={f.note} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 0' }}>
                <div style={{ background: '#F8FAFC', borderRadius: 9, padding: '10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.2rem', color: NAVY }}>{f.groupes}</div>
                  <div style={{ fontSize: '.7rem', color: '#64748b' }}>Groupes</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: 9, padding: '10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.2rem', color: BLUE }}>{f.sessions}h</div>
                  <div style={{ fontSize: '.7rem', color: '#64748b' }}>Heures / mois</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelectedFormateur(f)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', color: NAVY, fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}
              >
                Voir le profil
              </button>
              <button
                onClick={() => triggerToast(`Message envoyé à ${f.nom} !`)}
                style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}
              >
                Contacter
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add Trainer Modal */}
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
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '18px 24px', background: NAVY, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Nouveau membre du personnel</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddFormateur} style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Rôle</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as PersonnelFonction)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, background: '#fff' }}>
                  {!coordinatorMode && <option value="coordinateur">Coordinateur</option>}
                  {!coordinatorMode && <option value="commercial">Commercial</option>}
                  <option value="formateur">Formateur</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Nom complet</label>
                <input
                  type="text"
                  placeholder="Ex: Tariq El Amrani"
                  value={newNom}
                  onChange={e => setNewNom(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Fonction ou spécialité</label>
                <input
                  type="text"
                  placeholder="Ex: Langues — Allemand B1"
                  value={newSpec}
                  onChange={e => setNewSpec(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Adresse e-mail</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="nom@centre.ma" required style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Mot de passe temporaire</label>
                  <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} required style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Taux horaire (DH / h)</label>
                <input
                  type="number"
                  value={newTaux}
                  onChange={e => setNewTaux(Number(e.target.value))}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              {formError && <div className="auth-error" style={{ marginBottom: 14 }}>{formError}</div>}

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
                  Ajouter et créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer Profile Modal */}
      {selectedFormateur && (
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
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Profil du personnel</h3>
              <button onClick={() => setSelectedFormateur(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedFormateur.nom.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 18, color: NAVY, margin: 0 }}>{selectedFormateur.nom}</h4>
                  <strong style={{ display: 'block', color: BLUE, fontSize: 11, marginTop: 2 }}>{selectedFormateur.role}</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{selectedFormateur.specialite}</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#475569' }}><strong>Taux horaire :</strong> {selectedFormateur.taux} DH / h</div>
                <div style={{ fontSize: 13, color: '#475569' }}><strong>Contact Email :</strong> {selectedFormateur.email}</div>
                <div style={{ fontSize: 13, color: '#475569' }}><strong>Téléphone :</strong> {selectedFormateur.tel}</div>
                <div style={{ fontSize: 13, color: '#475569' }}><strong>Note moyenne des apprenants :</strong> ⭐ {selectedFormateur.note} / 5.0</div>
              </div>

              <button
                onClick={() => setSelectedFormateur(null)}
                style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
