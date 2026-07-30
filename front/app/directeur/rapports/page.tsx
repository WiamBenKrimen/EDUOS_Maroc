'use client'
import { useState } from 'react'

const NAVY = '#0F2347'
const BLUE = '#1B3A6B'
const GOLD = '#D97706'

const REPORTS = [
  { id: 1, titre: 'Rapport mensuel complet', desc: 'Résumé de toutes les activités : présences, paiements, inscriptions et performances.', format: 'PDF', taille: '2.4 Mo', date: 'Juil. 2025', type: 'monthly' },
  { id: 2, titre: 'Bilan des présences', desc: 'Feuilles d\'émargement signées et taux de présence par groupe et par formateur.', format: 'PDF', taille: '1.1 Mo', date: 'Juil. 2025', type: 'attendance' },
  { id: 3, titre: 'Rapport financier', desc: 'Encaissements, impayés, CA réalisé vs objectif et ventilation par formation.', format: 'Excel', taille: '890 Ko', date: 'Juil. 2025', type: 'finance' },
  { id: 4, titre: 'Liste des apprenants actifs', desc: 'Export complet de tous les apprenants avec leur statut, groupe et coordonnées.', format: 'Excel', taille: '340 Ko', date: 'Juil. 2025', type: 'students' },
  { id: 5, titre: 'Rapport de certification', desc: 'Attestations générées ce mois et taux de réussite aux évaluations finales.', format: 'PDF', taille: '760 Ko', date: 'Juil. 2025', type: 'cert' },
  { id: 6, titre: 'Rapport pédagogique', desc: 'Avancement des programmes par groupe, ressources consultées et évaluations.', format: 'PDF', taille: '1.8 Mo', date: 'Juil. 2025', type: 'pedagogy' },
  { id: 7, titre: 'Analyse des renouvellements', desc: 'Taux de renouvellement, motifs de départ et revenus récurrents projetés.', format: 'Excel', taille: '450 Ko', date: 'Juil. 2025', type: 'renewal' },
  { id: 8, titre: 'Rapport personnalisé', desc: 'Créez un rapport sur mesure en sélectionnant les données et la période souhaitées.', format: 'PDF / Excel', taille: '—', date: 'À générer', type: 'custom' },
]

export default function RapportsPage() {
  const [toast, setToast] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('Juillet 2025')
  
  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = REPORTS.filter(r =>
    r.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownloadReport = (r: typeof REPORTS[0]) => {
    if (r.type === 'custom') {
      setShowCustomModal(true)
      return
    }

    const textContent = `EDUOS MAROC - DIRECTION GÉNÉRALE\n` +
      `======================================================\n` +
      `RAPPORT: ${r.titre.toUpperCase()}\n` +
      `Période: ${selectedMonth}\n` +
      `Généré le: 2025\n` +
      `Organisme: EDUOS MAROC - Centre Rabat Hassan\n` +
      `======================================================\n\n` +
      `Description du document:\n${r.desc}\n\n` +
      `Données certifiées conformes par la direction.`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${r.titre.replace(/ /g, '_')}_${selectedMonth.replace(' ', '_')}.${r.format.toLowerCase()}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerToast(`Téléchargement du "${r.titre}" démarré !`)
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 24, color: NAVY, marginBottom: 4 }}>Rapports & Analytics Direction</h1>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>Téléchargez les bilans stratégiques et planifiez l'envoi de rapports automatisés.</p>
        </div>
      </div>

      {/* Bar Action */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher un rapport..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '9px 16px', borderRadius: 9, border: '1px solid #CBD5E1', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: '0.84rem', color: NAVY, background: '#fff', outline: 'none' }}
        />
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid #CBD5E1', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.84rem', color: NAVY, background: '#fff', outline: 'none', whiteSpace: 'nowrap' }}
        >
          <option>Juillet 2025</option>
          <option>Juin 2025</option>
          <option>Mai 2025</option>
          <option>Toute l'année 2025</option>
        </select>

        <button
          onClick={() => setShowScheduleModal(true)}
          style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #CBD5E1', background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.84rem', color: NAVY, cursor: 'pointer' }}
        >
          Planifier un rapport automatique
        </button>
      </div>

      {/* Grid of Reports */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p style={{ fontSize: 14, margin: '8px 0' }}>Aucun rapport trouvé</p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {filtered.map((r) => (
          <div
            key={r.id}
            style={{
              background: r.type === 'custom' ? `linear-gradient(135deg, ${NAVY}, ${BLUE})` : '#fff',
              borderRadius: 14,
              padding: 24,
              border: r.type === 'custom' ? 'none' : '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(15,35,71,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: r.type === 'custom' ? 'rgba(255,255,255,0.15)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.type === 'custom' ? '#fff' : BLUE }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 99, background: r.type === 'custom' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: r.type === 'custom' ? '#fff' : NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.68rem' }}>
                  {r.format}
                </span>
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1rem', color: r.type === 'custom' ? '#fff' : NAVY, marginBottom: 6 }}>{r.titre}</h3>
              <p style={{ fontSize: '.82rem', color: r.type === 'custom' ? 'rgba(255,255,255,0.75)' : '#64748b', lineHeight: 1.55, marginBottom: 20 }}>{r.desc}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.75rem', color: r.type === 'custom' ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>{r.date} · {r.taille}</span>
              <button
                onClick={() => handleDownloadReport(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: r.type === 'custom' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  background: r.type === 'custom' ? 'rgba(255,255,255,0.15)' : BLUE,
                  color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '.78rem',
                  cursor: 'pointer'
                }}
              >
                {r.type === 'custom' ? 'Créer le rapport' : 'Télécharger'}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Schedule Auto Report Modal */}
      {showScheduleModal && (
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
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Planifier un rapport automatique</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Fréquence d'envoi</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                  <option>Toutes les semaines (Chaque Lundi)</option>
                  <option>Tous les mois (Chaque 1er du mois)</option>
                  <option>Chaque fin de trimestre</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Email du destinataire</label>
                <input
                  type="email"
                  defaultValue="direction@eduos.ma"
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowScheduleModal(false)
                    triggerToast('Planification d\'envoi automatique activée !')
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Activer la planification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Builder Modal */}
      {showCustomModal && (
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
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, margin: 0 }}>Générateur de rapport personnalisé</h3>
              <button onClick={() => setShowCustomModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Données à inclure</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: NAVY, display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" defaultChecked /> Présences & Émargements</label>
                  <label style={{ fontSize: 13, color: NAVY, display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" defaultChecked /> Relevé financier & Encaissements</label>
                  <label style={{ fontSize: 13, color: NAVY, display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" defaultChecked /> Évaluations & Progrès des cohortes</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setShowCustomModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowCustomModal(false)
                    const textContent = `EDUOS MAROC - RAPPORT SUR MESURE DIRECTION\nData: Présences, Financier, Pédagogie`
                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `Rapport_Sur_Mesure_EDUOS.pdf`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    triggerToast('Rapport personnalisé généré et téléchargé !')
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  Générer le rapport
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
