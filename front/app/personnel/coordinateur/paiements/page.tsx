'use client'

import { useState } from 'react'

const INITIAL_PAIEMENTS = [
  { id: 1, nom: 'Ahmed Cherkaoui', groupe: 'Anglais B1', mois: 'Juillet 2025', montant: 450, statut: 'Payé', date: '22 juil.', mode: 'Virement' },
  { id: 2, nom: 'Fatima Zahra El Idrissi', groupe: 'Français B2', mois: 'Juillet 2025', montant: 680, statut: 'Payé', date: '21 juil.', mode: 'Espèces' },
  { id: 3, nom: 'Karim Ouali', groupe: 'Anglais B2', mois: 'Juillet 2025', montant: 520, statut: 'En attente', date: '—', mode: '—' },
  { id: 4, nom: 'Sara Benali', groupe: 'Gestion de projet', mois: 'Juillet 2025', montant: 750, statut: 'En retard', date: '—', mode: '—' },
  { id: 5, nom: 'Omar Tahiri', groupe: 'Marketing digital', mois: 'Juillet 2025', montant: 580, statut: 'En retard', date: '—', mode: '—' },
  { id: 6, nom: 'Nour El Houda Fassi', groupe: 'Français A2', mois: 'Juillet 2025', montant: 380, statut: 'Payé', date: '10 juil.', mode: 'Chèque' },
  { id: 7, nom: 'Yasmine Ait Ouali', groupe: 'Espagnol déb.', mois: 'Juillet 2025', montant: 420, statut: 'En attente', date: '—', mode: '—' },
  { id: 8, nom: 'Mehdi Bensouda', groupe: 'Anglais B1', mois: 'Juillet 2025', montant: 450, statut: 'Payé', date: '18 juil.', mode: 'TPE' },
]

export default function OperateurPaiementsPage() {
  const [paiements, setPaiements] = useState(INITIAL_PAIEMENTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<typeof INITIAL_PAIEMENTS[0] | null>(null)
  const [toastMessage, setToastMessage] = useState('')

  // New Payment Form
  const [newPayment, setNewPayment] = useState({
    nom: 'Ahmed Cherkaoui',
    groupe: 'Anglais B1',
    mois: 'Juillet 2025',
    montant: 450,
    mode: 'Espèces',
    ref: 'REC-2025-0982'
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleAddPayment = () => {
    const created = {
      id: Date.now(),
      nom: newPayment.nom,
      groupe: newPayment.groupe,
      mois: newPayment.mois,
      montant: Number(newPayment.montant),
      statut: 'Payé',
      date: 'Aujourd\'hui',
      mode: newPayment.mode
    }
    setPaiements(prev => [created, ...prev])
    setShowAddModal(false)
    triggerToast(`Paiement de ${created.montant} DH pour ${created.nom} enregistré !`)
  }

  const handleEncaisser = (id: number) => {
    setPaiements(prev => prev.map(p => p.id === id ? { ...p, statut: 'Payé', date: 'Aujourd\'hui', mode: 'Espèces' } : p))
    triggerToast('Paiement encaisse avec succès !')
  }

  const filtered = paiements.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) || p.groupe.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Tous les statuts' || p.statut === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    paye: paiements.filter(p => p.statut === 'Payé').length,
    attente: paiements.filter(p => p.statut === 'En attente').length,
    retard: paiements.filter(p => p.statut === 'En retard').length,
    totalEncaisse: paiements.filter(p => p.statut === 'Payé').reduce((acc, p) => acc + p.montant, 0)
  }

  return (
    <div>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#15803D', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(21,128,61,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="op-page-header">
        <div>
          <div className="op-breadcrumb">
            <span>Personnel</span>
            <span className="op-breadcrumb-sep">›</span>
            <span className="op-breadcrumb-active">Paiements</span>
          </div>
          <h1 className="op-page-title">Suivi des paiements</h1>
          <p className="op-page-subtitle">Gestion des mensualités et encaissements des apprenants</p>
        </div>
        <div>
          <button className="btn-navy" onClick={() => setShowAddModal(true)}>
            Enregistrer un paiement
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards Row */}
      <div className="op-stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <div className="op-stat-card" style={{ padding: '14px 16px' }}>
          <div className="op-stat-icon gold" style={{ width: 42, height: 42 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="6" rx="8" ry="3" />
              <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
              <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
            </svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Paiements réglés</span>
            <span className="op-stat-val" style={{ fontSize: '1.25rem' }}>{stats.paye}</span>
          </div>
        </div>

        <div className="op-stat-card" style={{ padding: '14px 16px' }}>
          <div className="op-stat-icon gold" style={{ width: 42, height: 42 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">En attente</span>
            <span className="op-stat-val" style={{ fontSize: '1.25rem' }}>{stats.attente}</span>
          </div>
        </div>

        <div className="op-stat-card" style={{ padding: '14px 16px' }}>
          <div className="op-stat-icon gold" style={{ width: 42, height: 42 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">En retard</span>
            <span className="op-stat-val" style={{ fontSize: '1.25rem' }}>{stats.retard}</span>
          </div>
        </div>

        <div className="op-stat-card" style={{ padding: '14px 16px' }}>
          <div className="op-stat-icon gold" style={{ width: 42, height: 42 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Total encaissé</span>
            <span className="op-stat-val" style={{ fontSize: '1.15rem' }}>{stats.totalEncaisse.toLocaleString('fr-FR')} DH</span>
          </div>
        </div>

        <div className="op-stat-card" style={{ padding: '14px 16px' }}>
          <div className="op-stat-icon gold" style={{ width: 42, height: 42 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="op-stat-content">
            <span className="op-stat-label">Mois en cours</span>
            <span className="op-stat-val" style={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}>Juillet 2025</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="op-card" style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="search-input" placeholder="Rechercher un apprenant..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: 38, paddingRight: 14, padding: '9px 14px 9px 38px', border: '1px solid #E2E8F0', borderRadius: 8 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.84rem', color: '#475569' }}>
              <span>Statut :</span>
              <select className="search-input" style={{ width: 130, padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFF' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="Tous les statuts">Tous</option>
                <option value="Payé">Payé</option>
                <option value="En attente">En attente</option>
                <option value="En retard">En retard</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.84rem', color: '#475569' }}>
              <span>Mois :</span>
              <select className="search-input" style={{ width: 140, padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFF' }}>
                <option>Juillet 2025</option>
                <option>Juin 2025</option>
                <option>Mai 2025</option>
              </select>
            </div>
          </div>

          <button className="btn btn-ghost" style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: '.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
        </div>
      </div>

      {/* Payments Data Table */}
      <div className="op-card" style={{ overflow: 'hidden' }}>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Apprenant</th>
                <th>Groupe</th>
                <th>Mois</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Mode</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isPaid = p.statut === 'Payé'
                const isPending = p.statut === 'En attente'
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#0F2347' }}>{p.nom}</td>
                    <td style={{ color: '#475569' }}>{p.groupe}</td>
                    <td style={{ color: '#475569' }}>{p.mois}</td>
                    <td style={{ fontWeight: 800, color: '#0F2347' }}>{p.montant} DH</td>
                    <td>
                      <span className={`op-status-underlined ${isPaid ? 'regle' : isPending ? 'attente' : 'retard'}`}>
                        {isPaid ? 'Réglé' : p.statut}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '.82rem' }}>{p.mode}</td>
                    <td style={{ color: '#64748B', fontSize: '.82rem' }}>{p.date}</td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                        {!isPaid ? (
                          <button className="btn-navy btn-sm" style={{ padding: '6px 14px', fontSize: '.78rem' }} onClick={() => handleEncaisser(p.id)}>
                            Encaisser
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ border: '1px solid #E2E8F0', padding: '6px 12px', fontSize: '.78rem', fontWeight: 600 }} onClick={() => setSelectedReceipt(p)}>
                            Reçu PDF
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', color: '#94A3B8' }} aria-label="Options">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: '14px 20px', background: '#FFFFFF', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '.82rem', color: '#64748B' }}>1–8 sur 8</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" style={{ border: '1px solid #E2E8F0', padding: '4px 10px' }}>‹</button>
            <button style={{ width: 28, height: 28, borderRadius: 6, background: '#0F2347', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '.8rem' }}>1</button>
            <button className="btn btn-ghost btn-sm" style={{ border: '1px solid #E2E8F0', padding: '4px 10px' }}>›</button>
          </div>
        </div>
      </div>

      {/* Register Payment Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="op-card" style={{ width: '100%', maxWidth: 440, padding: '24px' }}>
            <div className="row-between" style={{ marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F2347' }}>Enregistrer un règlement</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Nom de l'apprenant</label>
                <input className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newPayment.nom} onChange={e => setNewPayment(prev => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div className="section-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Groupe</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newPayment.groupe} onChange={e => setNewPayment(prev => ({ ...prev, groupe: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Montant (DH)</label>
                  <input type="number" className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newPayment.montant} onChange={e => setNewPayment(prev => ({ ...prev, montant: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="section-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Mode de règlement</label>
                  <select className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newPayment.mode} onChange={e => setNewPayment(prev => ({ ...prev, mode: e.target.value }))}>
                    <option>Espèces</option>
                    <option>Virement bancaire</option>
                    <option>Chèque</option>
                    <option>TPE / Carte</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Mois concerné</label>
                  <input className="search-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} value={newPayment.mois} onChange={e => setNewPayment(prev => ({ ...prev, mois: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 24, justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn-navy btn-sm" style={{ padding: '8px 16px' }} onClick={handleAddPayment}>Enregistrer et émettre reçu</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="op-card" style={{ width: '100%', maxWidth: 420, padding: '24px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 14, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#0F2347' }}>Reçu de Paiement</div>
              <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 2 }}>EDUOS MAROC · Centre Atlas</div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '16px', marginBottom: 20, textAlign: 'left', border: '1px solid #E2E8F0' }}>
              <div className="row-between" style={{ padding: '6px 0' }}><span style={{ fontSize: '.84rem', color: '#64748B' }}>Apprenant</span><strong style={{ color: '#0F2347' }}>{selectedReceipt.nom}</strong></div>
              <div className="row-between" style={{ padding: '6px 0' }}><span style={{ fontSize: '.84rem', color: '#64748B' }}>Groupe</span><span>{selectedReceipt.groupe}</span></div>
              <div className="row-between" style={{ padding: '6px 0' }}><span style={{ fontSize: '.84rem', color: '#64748B' }}>Période</span><span>{selectedReceipt.mois}</span></div>
              <div className="row-between" style={{ padding: '6px 0' }}><span style={{ fontSize: '.84rem', color: '#64748B' }}>Montant réglé</span><strong style={{ color: '#15803D', fontSize: '1.1rem' }}>{selectedReceipt.montant} DH</strong></div>
              <div className="row-between" style={{ padding: '6px 0' }}><span style={{ fontSize: '.84rem', color: '#64748B' }}>Mode</span><span>{selectedReceipt.mode !== '—' ? selectedReceipt.mode : 'Espèces'}</span></div>
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedReceipt(null)}>Fermer</button>
              <button className="btn-navy btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>Imprimer reçu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
