'use client'
import { useState } from 'react'

const TICKETS = [
  { id: 1, nom: 'Ahmed Cherkaoui', sujet: "Absence au cours du 21 juillet", temps: 'Il y a 1h', statut: 'Ouvert', messages: [
    { from: 'Ahmed Cherkaoui', text: "Bonjour, je n'ai pas pu assister au cours du 21 juillet pour raison médicale. Est-ce que je peux récupérer le cours manqué ?", time: '10:23', own: false },
    { from: 'Opérateur', text: "Bonjour Ahmed ! Bien sûr, nous allons vous organiser une session de rattrapage. Pouvez-vous être disponible samedi matin ?", time: '10:45', own: true },
    { from: 'Ahmed Cherkaoui', text: "Oui, samedi matin c'est parfait. Merci beaucoup !", time: '11:02', own: false },
  ]},
  { id: 2, nom: 'Fatima Zahra El Idrissi', sujet: "Question sur les ressources du cours", temps: 'Il y a 3h', statut: 'En cours', messages: [
    { from: 'Fatima Zahra El Idrissi', text: "Bonjour, je ne trouve pas les exercices de la semaine 3. Pourriez-vous m'envoyer le lien ?", time: '08:15', own: false },
    { from: 'Opérateur', text: "Bonjour Fatima ! Je vous transmets le lien maintenant. Les ressources sont disponibles dans l'onglet 'Ressources' de votre espace.", time: '09:00', own: true },
  ]},
  { id: 3, nom: 'Karim Ouali', sujet: "Changement de groupe souhaité", temps: 'Il y a 5h', statut: 'Résolu', messages: [
    { from: 'Karim Ouali', text: "Je souhaiterais changer de groupe pour le cours du soir si possible.", time: '06:30', own: false },
    { from: 'Opérateur', text: "Changement effectué ! Vous êtes maintenant inscrit dans le groupe Anglais B1 — Soir. La prochaine session est mardi.", time: '09:15', own: true },
  ]},
  { id: 4, nom: 'Sara Benali', sujet: "Problème de connexion à la plateforme", temps: 'Hier', statut: 'Ouvert', messages: [
    { from: 'Sara Benali', text: "Je n'arrive pas à me connecter depuis ce matin, mon mot de passe n'est pas accepté.", time: 'Hier 14:20', own: false },
  ]},
]

const STATUS_MAP: Record<string, { color: string; bg: string }> = {
  'Ouvert': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
  'En cours': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  'Résolu': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
}

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(1)
  const [reply, setReply] = useState('')
  const active = TICKETS.find(t => t.id === activeId)!

  return (
    <div style={{ padding: '36px', height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Messages & Support</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Tickets de support apprenants</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, flex: 1, overflow: 'hidden' }}>
        {/* Ticket list */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1ede8' }}>
            <input placeholder="Rechercher…" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {TICKETS.map(t => {
              const { color, bg } = STATUS_MAP[t.statut]
              return (
                <div key={t.id} onClick={() => setActiveId(t.id)} style={{ padding: '14px 16px', borderBottom: '1px solid #f1ede8', cursor: 'pointer', background: t.id === activeId ? 'rgba(27,58,107,.04)' : 'transparent', borderLeft: `3px solid ${t.id === activeId ? '#1B3A6B' : 'transparent'}`, transition: 'background .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.84rem', color: '#1a1823' }}>{t.nom}</span>
                    <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.68rem', color: '#94a3b8' }}>{t.temps}</span>
                  </div>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sujet}</p>
                  <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 99, background: bg, color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.65rem' }}>{t.statut}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Thread */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.95rem', color: '#1a1823', marginBottom: 2 }}>{active.nom}</h2>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{active.sujet}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #059669', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.75rem', color: '#059669', cursor: 'pointer' }}>Marquer résolu</button>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', color: '#64748b', cursor: 'pointer' }}>Transférer</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, background: '#faf8f5' }}>
            {active.messages.map((m, mi) => (
              <div key={mi} style={{ display: 'flex', justifyContent: m.own ? 'flex-end' : 'flex-start', gap: 10 }}>
                {!m.own && <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2D9CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.78rem', color: '#1B3A6B', flexShrink: 0 }}>{m.from.charAt(0)}</div>}
                <div style={{ maxWidth: '72%' }}>
                  <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.68rem', color: '#94a3b8', marginBottom: 4, textAlign: m.own ? 'right' : 'left' }}>{m.from} · {m.time}</div>
                  <div style={{ padding: '12px 16px', borderRadius: m.own ? '14px 14px 3px 14px' : '14px 14px 14px 3px', background: m.own ? '#1B3A6B' : '#fff', color: m.own ? '#fff' : '#374151', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', lineHeight: 1.55, border: m.own ? 'none' : '1px solid #E2D9CC', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 22px', borderTop: '1px solid #f1ede8', display: 'flex', gap: 10 }}>
            <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Répondre à ce ticket…" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1B3A6B')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2D9CC')} />
            <button disabled={!reply.trim()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: reply.trim() ? '#1B3A6B' : '#E2D9CC', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: reply.trim() ? 'pointer' : 'not-allowed' }}>Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  )
}
