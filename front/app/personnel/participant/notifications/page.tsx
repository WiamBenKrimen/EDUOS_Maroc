'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api-client'
import type { ParticipantNotification } from '@/lib/participant-types'

const categoryLabels: Record<string, string> = { cours: 'Cours', paiement: 'Paiement', ressource: 'Ressources', document: 'Document', rapport: 'Rapport', systeme: 'Système' }
const colors: Record<string, string> = { cours: '#2563EB', paiement: '#C9780D', ressource: '#16845B', document: '#7C3AED', rapport: '#0F766E', systeme: '#64748B' }

export default function NotificationsPage() {
  const [items, setItems] = useState<ParticipantNotification[]>([])
  const [selected, setSelected] = useState<ParticipantNotification | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [error, setError] = useState('')

  useEffect(() => { api.get<ParticipantNotification[]>('/participant/notifications').then(notifications => { setItems(notifications); setSelected(notifications[0] ?? null) }).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger les notifications.')) }, [])
  const filtered = useMemo(() => items.filter(item => `${item.titre} ${item.message}`.toLowerCase().includes(query.toLowerCase()) && (category === 'Toutes' || categoryLabels[item.categorie] === category)), [items, query, category])
  const unread = items.filter(item => !item.read_at).length

  async function selectNotification(notification: ParticipantNotification) {
    setSelected(notification)
    if (!notification.read_at) { await api.patch(`/participant/notifications/${notification.id}/read`, {}); setItems(current => current.map(item => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item)) }
  }
  async function markAllRead() { await api.patch('/participant/notifications/read-all', {}); setItems(current => current.map(item => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))) }

  return <div className="part-notifications-page">
    <header className="part-notifications-header"><div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Notifications</span></div><h1>Centre de notifications</h1><p>Nouveautés enregistrées pour votre compte.</p></div><button onClick={() => void markAllRead()} disabled={unread === 0}>Tout marquer comme lu</button></header>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <div className="part-notifications-layout"><section className="part-notifications-list"><div className="part-notifications-list-head"><strong>Toutes les notifications</strong><span>{unread} non lue{unread > 1 ? 's' : ''}</span></div><div className="part-notifications-tools"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une notification…" /><select value={category} onChange={event => setCategory(event.target.value)}><option>Toutes</option>{Array.from(new Set(items.map(item => categoryLabels[item.categorie] ?? item.categorie))).map(label => <option key={label}>{label}</option>)}</select></div>{filtered.map(notification => <button key={notification.id} className={`${selected?.id === notification.id ? 'active' : ''}${!notification.read_at ? ' unread' : ''}`} onClick={() => void selectNotification(notification)}><i style={{ background: colors[notification.categorie] ?? '#64748B' }} /><span><small>{categoryLabels[notification.categorie] ?? notification.categorie} · {new Date(notification.created_at).toLocaleString('fr-FR')}</small><strong>{notification.titre}</strong><p>{notification.message}</p></span>{!notification.read_at && <em />}</button>)}{!filtered.length && <div className="part-notifications-empty">Aucune notification trouvée.</div>}</section><article className="part-notification-detail">{selected ? <><span className="part-section-kicker">{categoryLabels[selected.categorie] ?? selected.categorie}</span><h2>{selected.titre}</h2><time>{new Date(selected.created_at).toLocaleString('fr-FR')}</time><div className="part-notification-detail-icon" style={{ color: colors[selected.categorie] ?? '#64748B' }}><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></div><p>{selected.message}</p></> : <p>Aucune notification sélectionnée.</p>}</article></div>
  </div>
}
