'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Buildings, CaretLeft, CaretRight, CheckCircle, Clock, DotsThreeVertical, XCircle } from '@phosphor-icons/react'

type Demande = {
  id: string; centreNom: string; responsableNom: string; telephone: string; email: string
  ville: string; tailleEleves: string; besoins: string[]; remarques: string; statut: string; date: string
}

const statusLabel: Record<string, string> = { en_attente: 'En attente', acceptee: 'Acceptée', refusee: 'Refusée' }

function mapDemande(item: any): Demande {
  return {
    id: String(item.id), centreNom: item.centre_nom, responsableNom: item.responsable_nom,
    telephone: item.telephone, email: item.email ?? '', ville: item.ville,
    tailleEleves: item.taille_apprenants ?? 'Non renseignée', besoins: item.besoins ?? [],
    remarques: item.remarques ?? '', statut: statusLabel[item.statut] ?? item.statut,
    date: item.created_at,
  }
}

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [selected, setSelected] = useState<Demande | null>(null)
  const [message, setMessage] = useState('')
  const [directorPassword, setDirectorPassword] = useState('')

  useEffect(() => {
    api.get<any[]>('/admin/centre-applications')
      .then(items => setDemandes(items.map(mapDemande)))
      .catch(error => setMessage(error instanceof Error ? error.message : 'Impossible de charger les candidatures.'))
  }, [])

  function update(id: string, statut: string) {
    setDemandes(items => items.map(item => item.id === id ? { ...item, statut } : item))
    setSelected(current => current?.id === id ? { ...current, statut } : current)
  }

  async function decide(demande: Demande, statut: 'acceptee' | 'refusee') {
    if (statut === 'acceptee' && !demande.email) { setMessage('Ajoutez une adresse e-mail au dossier avant de créer le compte directeur.'); return }
    if (statut === 'acceptee' && directorPassword.length < 8) { setMessage('Le mot de passe temporaire doit contenir au moins 8 caractères.'); return }
    try {
      await api.patch(`/admin/centre-applications/${demande.id}`, {
        statut,
        motif_refus: statut === 'refusee' ? "Dossier refusé par l'administration." : null,
        password: statut === 'acceptee' ? directorPassword : undefined,
      })
      update(demande.id, statusLabel[statut])
      setMessage(statut === 'acceptee'
        ? `Centre et compte directeur créés pour ${demande.responsableNom}. Identifiant : ${demande.email}`
        : `Candidature de ${demande.centreNom} refusée.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Traitement de la candidature impossible.')
    }
  }

  const waiting = demandes.filter(item => item.statut === 'En attente').length
  const statusStyle: Record<string, { background: string; color: string; icon: React.ReactNode }> = {
    'En attente': { background: '#FFF7E8', color: '#A15C00', icon: <Clock size={14} weight="bold" /> },
    'Acceptée': { background: '#ECFDF3', color: '#027A48', icon: <CheckCircle size={14} weight="bold" /> },
    'Refusée': { background: '#FEF3F2', color: '#B42318', icon: <XCircle size={14} weight="bold" /> },
  }
  return (
    <div>
      <header style={{ marginBottom: 24 }}><p style={{ color: '#64748B', fontSize: 12 }}>Administration / Centres</p><h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Demandes d’accès</h1><p style={{ color: '#64748B', fontSize: 13 }}>Vérifiez chaque dossier avant de créer le compte directeur du centre.</p></header>
      {message && <div role="status" style={{ padding: 13, marginBottom: 18, borderRadius: 10, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 13 }}>{message}</div>}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, marginBottom: 24 }}>
        {[
          ['En attente', waiting, <Clock size={24} weight="regular" />],
          ['Acceptées', demandes.filter(x => x.statut === 'Acceptée').length, <CheckCircle size={24} weight="regular" />],
          ['Refusées', demandes.filter(x => x.statut === 'Refusée').length, <XCircle size={24} weight="regular" />],
        ].map(([label, value, icon]) => <article key={String(label)} style={{ minHeight: 100, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 11, boxShadow: '0 2px 6px rgba(15,35,71,.04)' }}><span style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#F6F8FB', color: '#334155' }}>{icon}</span><span><span style={{ display: 'block', color: '#64748B', fontSize: 13 }}>{label}</span><strong style={{ display: 'block', marginTop: 5, color: '#0F2347', fontSize: 23 }}>{value}</strong></span></article>)}
      </section>
      <section style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.3fr .8fr .9fr .82fr .8fr 28px', gap: 16, alignItems: 'center', padding: '15px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 11, fontWeight: 800 }}><span>CENTRE</span><span>VILLE</span><span>CAPACITÉ</span><span>STATUT</span><span>DEMANDÉ LE</span><span>ACTIONS</span></div>
        {demandes.length === 0 && <p style={{ padding: 24, color: '#64748B' }}>Aucune candidature à afficher.</p>}
        {demandes.map(d => {
          const state = statusStyle[d.statut] ?? statusStyle['En attente']
          return <button key={d.id} onClick={() => { setSelected(d); setDirectorPassword(''); setMessage('') }} style={{ width: '100%', display: 'grid', gridTemplateColumns: '2.3fr .8fr .9fr .82fr .8fr 28px', gap: 16, alignItems: 'center', padding: '18px 20px', border: 0, borderBottom: '1px solid #EAF0F6', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}><span style={{ width: 54, height: 54, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#F6F8FB', color: '#475569' }}><Buildings size={26} weight="regular" /></span><span style={{ minWidth: 0 }}><strong style={{ display: 'block', color: '#0F2347', fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.centreNom}</strong><small style={{ display: 'block', color: '#475569', fontSize: 12, marginBottom: 3 }}>{d.responsableNom}</small><small style={{ color: '#64748B', fontSize: 11 }}>{d.id}</small></span></span>
            <span style={{ color: '#475569', fontSize: 12 }}>{d.ville}</span><span style={{ color: '#475569', fontSize: 12 }}>{d.tailleEleves}</span>
            <span style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, color: state.color, background: state.background, fontSize: 11, fontWeight: 800 }}>{state.icon}{d.statut}</span>
            <span style={{ color: '#64748B', fontSize: 12 }}>{new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span><DotsThreeVertical size={19} color="#0F2347" weight="bold" />
          </button>
        })}
      </section>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}><button disabled style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#98A2B3' }}><CaretLeft size={18} weight="bold" /></button><span style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', border: '1px solid #E2E8F0', borderRadius: 8, background: '#F8FAFC', color: '#1D4ED8', fontWeight: 800 }}>1</span><button disabled style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#98A2B3' }}><CaretRight size={18} weight="bold" /></button></div>
      {selected && <div role="dialog" aria-modal="true" onMouseDown={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(9,24,46,.55)' }}>
        <section onMouseDown={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 620, maxHeight: '88vh', overflow: 'auto', padding: 24, borderRadius: 14, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><small style={{ color: '#64748B' }}>{selected.id}</small><h2 style={{ color: '#0F2347', margin: '4px 0' }}>{selected.centreNom}</h2></div><button onClick={() => setSelected(null)} style={{ border: 0, background: '#F1F5F9', width: 34, height: 34, borderRadius: 8, cursor: 'pointer' }}>×</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '20px 0' }}>
            {[['Responsable', selected.responsableNom], ['Téléphone', selected.telephone], ['E-mail', selected.email || 'Non renseigné'], ['Ville', selected.ville], ['Taille', selected.tailleEleves], ['Date', new Date(selected.date).toLocaleDateString('fr-FR')]].map(([k,v]) => <div key={k} style={{ padding: 12, borderRadius: 9, background: '#F8FAFC' }}><small style={{ color: '#64748B' }}>{k}</small><strong style={{ display: 'block', color: '#0F2347', fontSize: 13, marginTop: 3 }}>{v}</strong></div>)}
          </div>
          <div style={{ marginBottom: 18 }}><small style={{ color: '#64748B' }}>Besoins</small><p style={{ color: '#334155', fontSize: 13 }}>{selected.besoins.join(' · ')}</p></div>
          {selected.statut === 'En attente' && <><label style={{ display: 'block', marginBottom: 18, color: '#334155', fontSize: 13, fontWeight: 700 }}>Mot de passe temporaire du directeur<input type="password" minLength={8} value={directorPassword} onChange={event => setDirectorPassword(event.target.value)} placeholder="Au moins 8 caractères" style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 7, padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14 }} /><small style={{ display: 'block', marginTop: 6, color: '#64748B', fontWeight: 400 }}>Communiquez ce mot de passe au directeur de manière sécurisée.</small></label><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button onClick={() => decide(selected, 'refusee')} className="btn-outline">Refuser</button><button onClick={() => decide(selected, 'acceptee')} className="btn-navy">Accepter et créer le directeur</button></div></>}
        </section>
      </div>}
    </div>
  )
}
