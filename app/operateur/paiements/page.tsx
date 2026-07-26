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
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(5,150,105,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Opérateur</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Paiements</span>
          </div>
          <h1 className="page-title">Suivi des paiements</h1>
          <p className="page-subtitle">Gestion des mensualités et encaissements des apprenants</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Enregistrer un paiement
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="row-between">
            <span className="card-meta">Paiements réglés</span>
            <span className="badge badge-green">Payé</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8, color: '#059669' }}>{stats.paye}</div>
        </div>

        <div className="kpi-card">
          <div className="row-between">
            <span className="card-meta">En attente</span>
            <span className="badge badge-gold">À venir</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8, color: '#C9922A' }}>{stats.attente}</div>
        </div>

        <div className="kpi-card">
          <div className="row-between">
            <span className="card-meta">En retard</span>
            <span className="badge badge-red">Relance requise</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8, color: '#DC2626' }}>{stats.retard}</div>
        </div>

        <div className="kpi-card">
          <div className="row-between">
            <span className="card-meta">Total encaissé</span>
            <span className="badge badge-navy">Mois en cours</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: '1.4rem' }}>{stats.totalEncaisse.toLocaleString('fr-FR')} DH</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card card-p" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Rechercher un apprenant ou groupe…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select className="search-input" style={{ width: 160, paddingLeft: 10 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Tous les statuts</option>
            <option>Payé</option>
            <option>En attente</option>
            <option>En retard</option>
          </select>

          <span className="card-meta" style={{ marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: '#1a2535' }}>{p.nom}</td>
                  <td style={{ color: '#5A6B7D' }}>{p.groupe}</td>
                  <td style={{ color: '#5A6B7D' }}>{p.mois}</td>
                  <td style={{ fontWeight: 800, color: '#1B3A6B' }}>{p.montant} DH</td>
                  <td>
                    <span className={`badge ${p.statut === 'Payé' ? 'badge-green' : p.statut === 'En attente' ? 'badge-gold' : 'badge-red'}`}>
                      {p.statut}
                    </span>
                  </td>
                  <td style={{ color: '#9AABBC', fontSize: '.78rem' }}>{p.mode}</td>
                  <td style={{ color: '#9AABBC', fontSize: '.78rem' }}>{p.date}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      {p.statut !== 'Payé' && (
                        <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '.72rem' }} onClick={() => handleEncaisser(p.id)}>
                          Encaisser
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '.72rem' }} onClick={() => setSelectedReceipt(p)}>
                        Reçu PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Payment Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 440 }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 className="card-title">Enregistrer un règlement</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Nom de l'apprenant</label>
                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newPayment.nom} onChange={e => setNewPayment(prev => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div className="section-grid-2">
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Groupe</label>
                  <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newPayment.groupe} onChange={e => setNewPayment(prev => ({ ...prev, groupe: e.target.value }))} />
                </div>
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Montant (DH)</label>
                  <input type="number" className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newPayment.montant} onChange={e => setNewPayment(prev => ({ ...prev, montant: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="section-grid-2">
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Mode de règlement</label>
                  <select className="search-input" style={{ width: '100%', paddingLeft: 10 }} value={newPayment.mode} onChange={e => setNewPayment(prev => ({ ...prev, mode: e.target.value }))}>
                    <option>Espèces</option>
                    <option>Virement bancaire</option>
                    <option>Chèque</option>
                    <option>TPE / Carte</option>
                  </select>
                </div>
                <div>
                  <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Mois concerné</label>
                  <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newPayment.mois} onChange={e => setNewPayment(prev => ({ ...prev, mois: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddPayment}>Enregistrer et émettre reçu</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #EEF0F4', paddingBottom: 12, marginBottom: 14 }}>
              <div className="card-title" style={{ fontSize: '1.1rem', color: '#1B3A6B' }}>Reçu de Paiement</div>
              <div className="card-meta">EDUOS MAROC · Centre Atlas</div>
            </div>

            <div style={{ background: '#F8F9FB', borderRadius: 9, padding: '16px', marginBottom: 16, textAlign: 'left' }}>
              <div className="row-between" style={{ padding: '4px 0' }}><span className="card-meta">Apprenant</span><strong>{selectedReceipt.nom}</strong></div>
              <div className="row-between" style={{ padding: '4px 0' }}><span className="card-meta">Groupe</span><span>{selectedReceipt.groupe}</span></div>
              <div className="row-between" style={{ padding: '4px 0' }}><span className="card-meta">Période</span><span>{selectedReceipt.mois}</span></div>
              <div className="row-between" style={{ padding: '4px 0' }}><span className="card-meta">Montant réglé</span><strong style={{ color: '#059669', fontSize: '1.1rem' }}>{selectedReceipt.montant} DH</strong></div>
              <div className="row-between" style={{ padding: '4px 0' }}><span className="card-meta">Mode</span><span>{selectedReceipt.mode !== '—' ? selectedReceipt.mode : 'Espèces'}</span></div>
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedReceipt(null)}>Fermer</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>Imprimer reçu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
