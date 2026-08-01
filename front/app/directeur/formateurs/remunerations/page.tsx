'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../lib/api-client'
import SearchFilterBar from '../../search-filter-bar'

type Remuneration = {
  id: string
  periode: string
  formateur: string
  specialite: string | string[]
  heures: number | string
  taux_horaire: number | string
  montant_total: number | string
  statut: string
}

const statusLabels: Record<string, string> = {
  en_attente: 'En attente',
  calculee: 'Calculée',
  validee: 'Validée',
  payee: 'Payée',
  annulee: 'Annulée',
}

export default function RemunerationsPage() {
  const [items, setItems] = useState<Remuneration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Tous')

  useEffect(() => {
    api.get<Remuneration[]>('/director/remunerations')
      .then(setItems)
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Chargement impossible.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fr-FR')
    return items.filter(item => {
      const speciality = Array.isArray(item.specialite) ? item.specialite.join(', ') : item.specialite
      const matches = !query || [item.formateur, speciality].some(value => String(value ?? '').toLocaleLowerCase('fr-FR').includes(query))
      return matches && (selectedStatus === 'Tous' || statusLabels[item.statut] === selectedStatus)
    })
  }, [items, searchQuery, selectedStatus])

  async function markPaid(item: Remuneration) {
    try {
      await api.patch(`/director/remunerations/${item.id}`, { statut: 'payee' })
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, statut: 'payee' } : candidate))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Mise à jour impossible.')
    }
  }

  const total = filtered.reduce((sum, item) => sum + Number(item.montant_total), 0)

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Formateurs</span><span className="page-breadcrumb-sep">›</span><span>Rémunérations</span></div>
          <h1 className="page-title">Rémunérations</h1>
          <p className="page-subtitle">Calculs enregistrés dans PostgreSQL via FastAPI.</p>
        </div>
      </header>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 18 }}>
        <div className="kpi-card"><div className="card-meta">Total affiché</div><div className="kpi-value">{total.toLocaleString('fr-MA')} DH</div></div>
        <div className="kpi-card"><div className="card-meta">Heures affichées</div><div className="kpi-value">{filtered.reduce((sum, item) => sum + Number(item.heures), 0)} h</div></div>
      </div>

      <SearchFilterBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher un formateur ou une spécialité..."
        resultCount={filtered.length}
        filters={[{ label: 'Statut', value: selectedStatus, options: ['Tous', 'En attente', 'Calculée', 'Validée', 'Payée', 'Annulée'], onChange: setSelectedStatus }]}
      />
      {error && <div className="card card-p" role="alert" style={{ color: '#B91C1C', marginBottom: 16 }}>{error}</div>}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Formateur', 'Spécialité', 'Période', 'Heures', 'Taux', 'Total', 'Statut', 'Action'].map(label => <th key={label} style={{ padding: '12px 16px', textAlign: 'left' }}>{label}</th>)}</tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ padding: 28, textAlign: 'center' }}>Chargement depuis FastAPI…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={8} style={{ padding: 28, textAlign: 'center', color: '#64748B' }}>Aucune rémunération trouvée.</td></tr>}
            {filtered.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #EEF2F7' }}>
                <td style={{ padding: '13px 16px', fontWeight: 700 }}>{item.formateur}</td>
                <td style={{ padding: '13px 16px' }}>{Array.isArray(item.specialite) ? item.specialite.join(', ') : item.specialite || '—'}</td>
                <td style={{ padding: '13px 16px' }}>{new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(item.periode))}</td>
                <td style={{ padding: '13px 16px' }}>{Number(item.heures)} h</td>
                <td style={{ padding: '13px 16px' }}>{Number(item.taux_horaire)} DH/h</td>
                <td style={{ padding: '13px 16px', fontWeight: 800 }}>{Number(item.montant_total).toLocaleString('fr-MA')} DH</td>
                <td style={{ padding: '13px 16px' }}><span className="badge badge-navy">{statusLabels[item.statut] ?? item.statut}</span></td>
                <td style={{ padding: '13px 16px' }}>{item.statut !== 'payee' && <button className="btn btn-outline btn-sm" onClick={() => void markPaid(item)}>Marquer payée</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
