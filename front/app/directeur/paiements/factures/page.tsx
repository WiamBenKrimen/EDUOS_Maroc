'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../lib/api-client'
import SearchFilterBar from '../../search-filter-bar'

type Invoice = {
  id: string
  numero: string
  participant_nom: string
  cohorte_nom: string
  montant_ttc: number | string
  date_echeance: string
  facture_statut: string
}

const labels: Record<string, string> = {
  payee: 'Payée',
  partiellement_payee: 'Partiellement payée',
  en_attente: 'En attente',
  en_retard: 'En retard',
  annulee: 'Annulée',
  brouillon: 'Brouillon',
  emise: 'Émise',
}

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Toutes')

  useEffect(() => {
    api.get<Invoice[]>('/director/paiements')
      .then(setInvoices)
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Chargement impossible.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fr-FR')
    return invoices.filter(invoice => {
      const status = labels[invoice.facture_statut] ?? invoice.facture_statut
      const matchesQuery = !query || [
        invoice.numero,
        invoice.participant_nom,
        invoice.cohorte_nom,
      ].some(value => String(value ?? '').toLocaleLowerCase('fr-FR').includes(query))
      return matchesQuery && (selectedStatus === 'Toutes' || status === selectedStatus)
    })
  }, [invoices, searchQuery, selectedStatus])

  function exportCsv() {
    const rows = [
      ['Numero', 'Apprenant', 'Formation', 'Montant TTC', 'Echeance', 'Statut'],
      ...filtered.map(item => [
        item.numero,
        item.participant_nom,
        item.cohorte_nom,
        String(item.montant_ttc),
        item.date_echeance,
        labels[item.facture_statut] ?? item.facture_statut,
      ]),
    ]
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'factures-eduos.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Paiements</span><span className="page-breadcrumb-sep">›</span><span>Factures</span></div>
          <h1 className="page-title">Factures</h1>
          <p className="page-subtitle">Données de facturation synchronisées avec FastAPI.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportCsv} disabled={!filtered.length}>Exporter CSV</button>
      </header>

      <SearchFilterBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher par numéro, apprenant ou formation..."
        resultCount={filtered.length}
        filters={[{
          label: 'Statut',
          value: selectedStatus,
          options: ['Toutes', 'Payée', 'Partiellement payée', 'En attente', 'En retard', 'Annulée', 'Brouillon', 'Émise'],
          onChange: setSelectedStatus,
        }]}
      />

      {error && <div className="card card-p" role="alert" style={{ color: '#B91C1C', marginBottom: 16 }}>{error}</div>}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['N° Facture', 'Apprenant', 'Formation', 'Montant', 'Échéance', 'Statut'].map(label => <th key={label} style={{ padding: '12px 18px', textAlign: 'left' }}>{label}</th>)}</tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center' }}>Chargement depuis FastAPI…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: '#64748B' }}>Aucune facture trouvée.</td></tr>}
            {filtered.map(invoice => (
              <tr key={invoice.id} style={{ borderTop: '1px solid #EEF2F7' }}>
                <td style={{ padding: '13px 18px', fontWeight: 700 }}>{invoice.numero}</td>
                <td style={{ padding: '13px 18px' }}>{invoice.participant_nom}</td>
                <td style={{ padding: '13px 18px' }}>{invoice.cohorte_nom}</td>
                <td style={{ padding: '13px 18px', fontWeight: 800 }}>{Number(invoice.montant_ttc).toLocaleString('fr-MA')} DH</td>
                <td style={{ padding: '13px 18px' }}>{new Intl.DateTimeFormat('fr-FR').format(new Date(invoice.date_echeance))}</td>
                <td style={{ padding: '13px 18px' }}><span className="badge badge-navy">{labels[invoice.facture_statut] ?? invoice.facture_statut}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
