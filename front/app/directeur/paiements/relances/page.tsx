'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../lib/api-client'
import SearchFilterBar from '../../search-filter-bar'

type Rule = {
  id: string
  titre: string
  offset_days: number
  canal: string
  message_template: string
  actif: boolean
  messages_envoyes: number
}

function triggerLabel(offset: number) {
  if (offset === 0) return "Le jour de l'échéance"
  return offset < 0
    ? `${Math.abs(offset)} jour(s) avant l'échéance`
    : `${offset} jour(s) après l'échéance`
}

export default function RelancesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Toutes')

  useEffect(() => {
    api.get<Rule[]>('/director/reminder-rules')
      .then(setRules)
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Chargement impossible.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fr-FR')
    return rules.filter(rule => {
      const matchesQuery = !query || [rule.titre, rule.canal, rule.message_template]
        .some(value => value.toLocaleLowerCase('fr-FR').includes(query))
      const matchesStatus = activeFilter === 'Toutes' || (activeFilter === 'Actives' ? rule.actif : !rule.actif)
      return matchesQuery && matchesStatus
    })
  }, [rules, searchQuery, activeFilter])

  async function toggle(rule: Rule) {
    setError('')
    try {
      await api.patch(`/director/reminder-rules/${rule.id}`, { actif: !rule.actif })
      setRules(current => current.map(item => item.id === rule.id ? { ...item, actif: !item.actif } : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Mise à jour impossible.')
    }
  }

  async function sendNow() {
    setError('')
    try {
      const result = await api.post<{ sent: number }>('/director/reminders/send', {})
      setNotice(`${result.sent} relance(s) créée(s) et enregistrée(s).`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Envoi impossible.')
    }
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Paiements</span><span className="page-breadcrumb-sep">›</span><span>Relances</span></div>
          <h1 className="page-title">Relances automatiques</h1>
          <p className="page-subtitle">Règles et historique enregistrés dans le backend.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => void sendNow()} disabled={!rules.some(rule => rule.actif)}>Exécuter maintenant</button>
      </header>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        <div className="kpi-card"><div className="card-meta">Règles actives</div><div className="kpi-value">{rules.filter(rule => rule.actif).length}</div></div>
        <div className="kpi-card"><div className="card-meta">Messages ce mois</div><div className="kpi-value">{rules.reduce((sum, rule) => sum + Number(rule.messages_envoyes), 0)}</div></div>
        <div className="kpi-card"><div className="card-meta">Règles configurées</div><div className="kpi-value">{rules.length}</div></div>
      </div>

      <SearchFilterBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher une règle, un canal ou un message..."
        resultCount={filtered.length}
        filters={[{ label: 'État', value: activeFilter, options: ['Toutes', 'Actives', 'Inactives'], onChange: setActiveFilter }]}
      />
      {error && <div className="card card-p" role="alert" style={{ color: '#B91C1C', marginBottom: 16 }}>{error}</div>}
      {notice && <div className="card card-p" role="status" style={{ color: '#047857', marginBottom: 16 }}>{notice}</div>}
      {loading && <div className="card card-p" style={{ textAlign: 'center' }}>Chargement depuis FastAPI…</div>}
      {!loading && !filtered.length && <div className="card card-p" style={{ textAlign: 'center', color: '#64748B' }}>Aucune règle trouvée.</div>}
      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map(rule => (
          <article key={rule.id} className="card card-p" style={{ opacity: rule.actif ? 1 : .65 }}>
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="row" style={{ marginBottom: 8 }}><h2 style={{ fontSize: 16 }}>{rule.titre}</h2><span className="badge badge-green">{rule.canal}</span></div>
                <div className="card-meta">{triggerLabel(rule.offset_days)} · {rule.messages_envoyes} message(s) ce mois</div>
              </div>
              <button className={`btn btn-sm ${rule.actif ? 'btn-primary' : 'btn-outline'}`} onClick={() => void toggle(rule)}>{rule.actif ? 'Active' : 'Inactive'}</button>
            </div>
            <p style={{ marginTop: 14, background: '#F8FAFC', borderLeft: '3px solid #C9922A', borderRadius: 8, padding: 12, color: '#475569' }}>{rule.message_template}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
