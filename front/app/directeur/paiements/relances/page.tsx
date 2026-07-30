'use client'
import { useState } from 'react'
import SearchFilterBar from '../../search-filter-bar'

interface Rule {
  id: string
  titre: string
  declencheur: string
  canal: string
  message: string
  actif: boolean
}

const INITIAL_RULES: Rule[] = [
  { id: '1', titre: 'Rappel 5 jours avant échéance', declencheur: '5 jours avant la date limite', canal: 'WhatsApp', message: "Bonjour {prenom}, votre mensualité de {montant} DH est due dans 5 jours. Payer en ligne : eduos.ma/paiement", actif: true },
  { id: '2', titre: 'Rappel le jour J', declencheur: "Le jour de l'échéance", canal: 'WhatsApp + SMS', message: "Rappel : votre mensualité de {montant} DH est due aujourd'hui. Payer maintenant : eduos.ma/paiement", actif: true },
  { id: '3', titre: 'Relance J+3', declencheur: '3 jours après échéance', canal: 'WhatsApp', message: "Bonjour {prenom}, votre paiement de {montant} DH est en retard de 3 jours. Veuillez régulariser : eduos.ma/paiement", actif: true },
  { id: '4', titre: 'Relance J+10', declencheur: '10 jours après échéance', canal: 'WhatsApp + Email', message: "URGENT : Votre mensualité de {montant} DH est en retard de 10 jours. Sans régularisation, votre accès sera suspendu.", actif: false },
  { id: '5', titre: 'Renouvellement 30 jours avant', declencheur: "30 jours avant l'expiration du contrat", canal: 'WhatsApp', message: "Votre formation se termine le {date_fin}. Renouvelez maintenant et profitez de 15% de réduction : eduos.ma/renew", actif: true },
]

export default function RelancesPage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Toutes')

  const filteredRules = rules.filter(rule => {
    const query = searchQuery.trim().toLocaleLowerCase('fr-FR')
    const matchesQuery = !query || [rule.titre, rule.declencheur, rule.canal, rule.message].some(value => value.toLocaleLowerCase('fr-FR').includes(query))
    const matchesStatus = activeFilter === 'Toutes' || (activeFilter === 'Actives' ? rule.actif : !rule.actif)
    return matchesQuery && matchesStatus
  })

  function toggle(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, actif: !r.actif } : r))
  }

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <nav style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8', marginBottom: 8 }}>
            <span>Paiements</span><span style={{ margin: '0 6px' }}>›</span><span style={{ color: '#1B3A6B' }}>Relances automatiques</span>
          </nav>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Relances automatiques</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Configurez les règles d'envoi automatique via WhatsApp et SMS</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle règle
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Règles actives', val: String(rules.filter(r => r.actif).length), color: '#059669' },
          { label: 'Messages envoyés ce mois', val: '247', color: '#1B3A6B' },
          { label: 'Taux de réponse', val: '68%', color: '#C9922A' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E2D9CC', boxShadow: '0 1px 6px rgba(27,58,107,.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.5rem', color: s.color, marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <SearchFilterBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher une règle, un canal ou un déclencheur..."
        resultCount={filteredRules.length}
        filters={[{ label: 'État', value: activeFilter, options: ['Toutes', 'Actives', 'Inactives'], onChange: setActiveFilter }]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredRules.length === 0 && <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', background: '#fff', border: '1px solid #E2D9CC', borderRadius: 12, fontSize: '.85rem' }}>Aucune règle ne correspond a votre recherche.</div>}
        {filteredRules.map(rule => (
          <div key={rule.id} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: `1.5px solid ${rule.actif ? 'rgba(27,58,107,.15)' : '#E2D9CC'}`, boxShadow: '0 2px 12px rgba(27,58,107,.04)', opacity: rule.actif ? 1 : 0.65, transition: 'opacity .2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '1rem', color: '#1a1823' }}>{rule.titre}</h3>
                  <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 99, background: 'rgba(5,150,105,.08)', color: '#059669', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.65rem' }}>{rule.canal}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{rule.declencheur}</span>
                  </div>
                </div>
                <div style={{ background: '#f8f5ef', borderRadius: 10, padding: '12px 16px', borderLeft: '3px solid #C9922A' }}>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#374151', lineHeight: 1.55, fontStyle: 'italic' }}>"{rule.message}"</p>
                </div>
              </div>

              {/* Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginLeft: 24 }}>
                <button onClick={() => toggle(rule.id)} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: rule.actif ? '#1B3A6B' : '#E2D9CC', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: rule.actif ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}/>
                </button>
                <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.7rem', color: rule.actif ? '#059669' : '#94a3b8', fontWeight: 600 }}>{rule.actif ? 'Actif' : 'Inactif'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#1B3A6B', cursor: 'pointer' }}>Modifier le message</button>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#64748b', cursor: 'pointer' }}>Historique d'envoi</button>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#DC2626', cursor: 'pointer', marginLeft: 'auto' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
