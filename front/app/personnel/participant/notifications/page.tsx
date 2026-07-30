'use client'

import { useMemo, useState } from 'react'

const INITIAL_NOTIFICATIONS = [
  { id: 1, category: 'Cours', title: 'Rappel de cours', message: 'Votre cours d’Anglais B2 est prévu demain à 10h00 en Salle 1.', date: 'Aujourd’hui, 09h12', unread: true, color: '#2563eb' },
  { id: 2, category: 'Paiement', title: 'Prochaine mensualité', message: 'Votre prochaine mensualité de 450 DH arrive à échéance le 1er février 2025.', date: 'Aujourd’hui, 07h40', unread: true, color: '#c9780d' },
  { id: 3, category: 'Ressources', title: 'Nouveaux exercices disponibles', message: 'Les exercices de la semaine 4 sur le Present Perfect sont maintenant disponibles.', date: 'Hier, 14h00', unread: false, color: '#16845b' },
  { id: 4, category: 'Document', title: 'Attestation ajoutée', message: 'Votre attestation de présence a été ajoutée à votre espace documents.', date: '10 janvier, 16h25', unread: false, color: '#7c3aed' },
  { id: 5, category: 'Cours', title: 'Changement de salle', message: 'La séance du mercredi aura lieu en Salle 3.', date: '8 janvier, 11h10', unread: false, color: '#2563eb' },
  { id: 6, category: 'Paiement', title: 'Reçu validé', message: 'Le reçu de décembre a été validé par l’administration.', date: '3 janvier, 09h30', unread: false, color: '#c9780d' },
  { id: 7, category: 'Ressources', title: 'Support de cours ajouté', message: 'Un nouveau support de grammaire est disponible.', date: '2 janvier, 15h45', unread: false, color: '#16845b' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [selected, setSelected] = useState(INITIAL_NOTIFICATIONS[0])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [page, setPage] = useState(1)
  const perPage = 4
  const filtered = useMemo(() => notifications.filter((item) =>
    `${item.title} ${item.message}`.toLowerCase().includes(query.toLowerCase()) &&
    (category === 'Toutes' || item.category === category)
  ), [notifications, query, category])
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  const selectNotification = (notification: typeof INITIAL_NOTIFICATIONS[number]) => {
    setSelected(notification)
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, unread: false } : item))
  }

  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
  const unread = notifications.filter((item) => item.unread).length

  return (
    <div className="part-notifications-page">
      <header className="part-notifications-header">
        <div>
          <div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Notifications</span></div>
          <h1>Centre de notifications</h1>
          <p>Suivez les nouveautés concernant votre formation.</p>
        </div>
        <button onClick={markAllRead} disabled={unread === 0}>Tout marquer comme lu</button>
      </header>

      <div className="part-notifications-layout">
        <section className="part-notifications-list">
          <div className="part-notifications-list-head">
            <strong>Toutes les notifications</strong>
            <span>{unread} non {unread > 1 ? 'lues' : 'lue'}</span>
          </div>
          <div className="part-notifications-tools">
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Rechercher une notification..." />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}><option>Toutes</option><option>Cours</option><option>Paiement</option><option>Ressources</option><option>Document</option></select>
          </div>
          {visible.map((notification) => (
            <button
              key={notification.id}
              className={`${selected.id === notification.id ? 'active' : ''}${notification.unread ? ' unread' : ''}`}
              onClick={() => selectNotification(notification)}
            >
              <i style={{ background: notification.color }} />
              <span>
                <small>{notification.category} · {notification.date}</small>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </span>
              {notification.unread && <em />}
            </button>
          ))}
          {visible.length === 0 && <div className="part-notifications-empty">Aucune notification trouvée.</div>}
          <div className="part-notifications-pagination">
            <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
            <div><button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button><span>{page} / {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage(page + 1)}>→</button></div>
          </div>
        </section>

        <article className="part-notification-detail">
          <span className="part-section-kicker">{selected.category}</span>
          <h2>{selected.title}</h2>
          <time>{selected.date}</time>
          <div className="part-notification-detail-icon" style={{ color: selected.color }}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p>{selected.message}</p>
          <div className="part-notification-context">
            <span>Formation concernée</span>
            <strong>Anglais B2 · Groupe du matin</strong>
          </div>
        </article>
      </div>
    </div>
  )
}
