'use client'

import { useEffect, useState } from 'react'
import { createAccount } from '../../../lib/auth'

type Demande = {
  id: string; centreNom: string; responsableNom: string; telephone: string; email: string
  ville: string; tailleEleves: string; besoins: string[]; remarques: string; statut: string; date: string
}

const DEMO: Demande[] = [{
  id: 'CAND-2026-1042', centreNom: 'Centre Horizon Formation', responsableNom: 'Salma El Mansouri',
  telephone: '+212 6 12 34 56 78', email: 'direction@horizon.ma', ville: 'Rabat - Salé',
  tailleEleves: '50 à 200 élèves', besoins: ['Planning & Salles', 'Paiements & Mensualités'],
  remarques: 'Nous souhaitons démarrer avec deux cohortes.', statut: 'En attente', date: '2026-07-29T09:20:00.000Z',
}]

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>(DEMO)
  const [selected, setSelected] = useState<Demande | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('eduos_candidatures') ?? '[]') as Demande[]
    if (saved.length) setDemandes([...saved, ...DEMO])
  }, [])

  function update(id: string, statut: string) {
    setDemandes(items => items.map(item => item.id === id ? { ...item, statut } : item))
    setSelected(current => current?.id === id ? { ...current, statut } : current)
  }

  function accepter(demande: Demande) {
    if (!demande.email) { setMessage('Ajoutez une adresse e-mail au dossier avant de créer le compte directeur.'); return }
    try {
      createAccount({ nom: demande.responsableNom, email: demande.email, password: 'Bienvenue2026!', role: 'directeur', centreId: demande.id })
      update(demande.id, 'Acceptée')
      setMessage(`Compte directeur créé pour ${demande.responsableNom}. Identifiant : ${demande.email}`)
    } catch (error) {
      update(demande.id, 'Acceptée')
      setMessage(error instanceof Error ? error.message : 'Compte déjà créé.')
    }
  }

  const waiting = demandes.filter(item => item.statut === 'En attente').length
  return (
    <div>
      <header style={{ marginBottom: 24 }}><p style={{ color: '#64748B', fontSize: 12 }}>Administration / Centres</p><h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Demandes d’accès</h1><p style={{ color: '#64748B', fontSize: 13 }}>Vérifiez chaque dossier avant de créer le compte directeur du centre.</p></header>
      {message && <div role="status" style={{ padding: 13, marginBottom: 18, borderRadius: 10, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 13 }}>{message}</div>}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 22 }}>
        {[['En attente', waiting], ['Acceptées', demandes.filter(x => x.statut === 'Acceptée').length], ['Refusées', demandes.filter(x => x.statut === 'Refusée').length]].map(([label, value]) => <article key={label} style={{ padding: 18, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12 }}><span style={{ color: '#64748B', fontSize: 12 }}>{label}</span><strong style={{ display: 'block', marginTop: 6, color: '#0F2347', fontSize: 25 }}>{value}</strong></article>)}
      </section>
      <section style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
        {demandes.map(d => <button key={d.id} onClick={() => { setSelected(d); setMessage('') }} style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr .7fr', gap: 12, alignItems: 'center', padding: 16, border: 0, borderBottom: '1px solid #F1F5F9', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
          <span><strong style={{ display: 'block', color: '#0F2347' }}>{d.centreNom}</strong><small style={{ color: '#64748B' }}>{d.responsableNom} · {d.id}</small></span>
          <span style={{ color: '#475569', fontSize: 12 }}>{d.ville}</span><span style={{ color: '#475569', fontSize: 12 }}>{d.tailleEleves}</span>
          <span style={{ color: d.statut === 'En attente' ? '#92400E' : d.statut === 'Acceptée' ? '#047857' : '#B91C1C', fontSize: 11, fontWeight: 800 }}>{d.statut}</span>
        </button>)}
      </section>
      {selected && <div role="dialog" aria-modal="true" onMouseDown={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(9,24,46,.55)' }}>
        <section onMouseDown={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 620, maxHeight: '88vh', overflow: 'auto', padding: 24, borderRadius: 14, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><small style={{ color: '#64748B' }}>{selected.id}</small><h2 style={{ color: '#0F2347', margin: '4px 0' }}>{selected.centreNom}</h2></div><button onClick={() => setSelected(null)} style={{ border: 0, background: '#F1F5F9', width: 34, height: 34, borderRadius: 8, cursor: 'pointer' }}>×</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '20px 0' }}>
            {[['Responsable', selected.responsableNom], ['Téléphone', selected.telephone], ['E-mail', selected.email || 'Non renseigné'], ['Ville', selected.ville], ['Taille', selected.tailleEleves], ['Date', new Date(selected.date).toLocaleDateString('fr-FR')]].map(([k,v]) => <div key={k} style={{ padding: 12, borderRadius: 9, background: '#F8FAFC' }}><small style={{ color: '#64748B' }}>{k}</small><strong style={{ display: 'block', color: '#0F2347', fontSize: 13, marginTop: 3 }}>{v}</strong></div>)}
          </div>
          <div style={{ marginBottom: 18 }}><small style={{ color: '#64748B' }}>Besoins</small><p style={{ color: '#334155', fontSize: 13 }}>{selected.besoins.join(' · ')}</p></div>
          {selected.statut === 'En attente' && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button onClick={() => update(selected.id, 'Refusée')} className="btn-outline">Refuser</button><button onClick={() => accepter(selected)} className="btn-navy">Accepter et créer le directeur</button></div>}
        </section>
      </div>}
    </div>
  )
}
