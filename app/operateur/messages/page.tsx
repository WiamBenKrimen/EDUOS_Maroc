'use client'

import { useState } from 'react'

const INITIAL_TICKETS = [
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

export default function MessagesPage() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS)
  const [activeId, setActiveId] = useState(1)
  const [replyText, setReplyText] = useState('')
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [newTicket, setNewTicket] = useState({
    nom: 'Ahmed Cherkaoui',
    sujet: 'Rappel de document manquant',
    text: 'Bonjour Ahmed, merci de nous transmettre votre photo d\'identité.'
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const active = tickets.find(t => t.id === activeId) ?? tickets[0]

  const handleSendReply = () => {
    if (!replyText.trim()) return
    const now = new Date()
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`
    
    setTickets(prev => prev.map(t => {
      if (t.id === active.id) {
        return {
          ...t,
          statut: 'En cours',
          messages: [...t.messages, { from: 'Opérateur', text: replyText.trim(), time: timeStr, own: true }]
        }
      }
      return t
    }))
    setReplyText('')
    triggerToast('Message envoyé !')
  }

  const handleResolve = () => {
    setTickets(prev => prev.map(t => t.id === active.id ? { ...t, statut: 'Résolu' } : t))
    triggerToast('Ticket marqué comme Résolu !')
  }

  const handleCreateTicket = () => {
    const created = {
      id: Date.now(),
      nom: newTicket.nom,
      sujet: newTicket.sujet,
      temps: 'À l\'instant',
      statut: 'Ouvert',
      messages: [{ from: 'Opérateur', text: newTicket.text, time: 'À l\'instant', own: true }]
    }
    setTickets(prev => [created, ...prev])
    setActiveId(created.id)
    setShowNewModal(false)
    triggerToast(`Nouveau message envoyé à ${newTicket.nom} !`)
  }

  const filteredTickets = tickets.filter(t => t.nom.toLowerCase().includes(search.toLowerCase()) || t.sujet.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#1B3A6B', color: '#fff', padding: '12px 20px', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', boxShadow: '0 8px 24px rgba(27,58,107,.3)' }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Opérateur</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Messages</span>
          </div>
          <h1 className="page-title">Messages & Support</h1>
          <p className="page-subtitle">Échanges en direct avec les apprenants et les formateurs</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouveau message
          </button>
        </div>
      </div>

      {/* Chat Interface Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: 'calc(100vh - 230px)' }}>
        {/* Ticket List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #EEF0F4' }}>
            <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Rechercher un échange…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setActiveId(t.id)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #EEF0F4',
                  cursor: 'pointer',
                  background: t.id === active.id ? '#EBF0FA' : 'transparent',
                  borderLeft: `3px solid ${t.id === active.id ? '#1B3A6B' : 'transparent'}`,
                  transition: 'background .15s',
                }}
              >
                <div className="row-between" style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: '.84rem', color: '#1a2535' }}>{t.nom}</span>
                  <span style={{ fontSize: '.68rem', color: '#9AABBC' }}>{t.temps}</span>
                </div>
                <p className="card-meta" style={{ marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sujet}</p>
                <span className={`badge ${t.statut === 'Ouvert' ? 'badge-red' : t.statut === 'En cours' ? 'badge-gold' : 'badge-green'}`}>
                  {t.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="row-between" style={{ padding: '14px 20px', borderBottom: '1px solid #EEF0F4', background: '#F8F9FB' }}>
            <div>
              <h2 className="card-title">{active.nom}</h2>
              <p className="card-meta" style={{ marginTop: 2 }}>{active.sujet}</p>
            </div>
            <div className="row" style={{ gap: 8 }}>
              {active.statut !== 'Résolu' && (
                <button className="btn btn-outline btn-sm" onClick={handleResolve}>
                  Marquer résolu
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, background: '#FAFBFC' }}>
            {active.messages.map((m, mi) => (
              <div key={mi} style={{ display: 'flex', justifyContent: m.own ? 'flex-end' : 'flex-start', gap: 10 }}>
                {!m.own && (
                  <div className="avatar avatar-sm avatar-navy" style={{ width: 32, height: 32, fontSize: '.75rem' }}>
                    {m.from.charAt(0)}
                  </div>
                )}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ fontSize: '.68rem', color: '#9AABBC', marginBottom: 4, textAlign: m.own ? 'right' : 'left' }}>
                    {m.from} · {m.time}
                  </div>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: m.own ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: m.own ? '#1B3A6B' : '#fff',
                      color: m.own ? '#fff' : '#374151',
                      border: m.own ? 'none' : '1px solid #E8ECF2',
                      boxShadow: '0 2px 6px rgba(0,0,0,.04)',
                      fontSize: '.84rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className="row" style={{ padding: '14px 20px', borderTop: '1px solid #EEF0F4', gap: 10 }}>
            <input
              className="search-input"
              style={{ flex: 1, paddingLeft: 14 }}
              placeholder="Écrivez votre réponse…"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendReply()}
            />
            <button className="btn btn-primary btn-sm" disabled={!replyText.trim()} onClick={handleSendReply}>
              Envoyer
            </button>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,24,46,.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 460 }}>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 className="card-title">Nouveau message</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Destinataire</label>
                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newTicket.nom} onChange={e => setNewTicket(prev => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div>
                <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Sujet</label>
                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} value={newTicket.sujet} onChange={e => setNewTicket(prev => ({ ...prev, sujet: e.target.value }))} />
              </div>
              <div>
                <label className="card-meta" style={{ display: 'block', marginBottom: 4 }}>Message</label>
                <textarea className="search-input" rows={4} style={{ width: '100%', paddingLeft: 12, resize: 'vertical' }} value={newTicket.text} onChange={e => setNewTicket(prev => ({ ...prev, text: e.target.value }))} />
              </div>
            </div>

            <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateTicket}>Envoyer le message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
