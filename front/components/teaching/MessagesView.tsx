'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api-client'

type Contact = { id: string; nom: string; role: string; personnel_fonction: string | null }
type Message = { id: string; sender_id: string; sender_name: string; message: string; created_at: string; own: boolean }
type Ticket = { id: string; sujet: string; statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme'; created_at: string; updated_at: string; contact: string; messages: Message[] }

const statusLabels = { ouvert: 'Ouvert', en_cours: 'En cours', resolu: 'Résolu', ferme: 'Fermé' }

export default function MessagesView() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeId, setActiveId] = useState('')
  const [reply, setReply] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ recipient_id: '', sujet: '', message: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const [ticketItems, contactItems] = await Promise.all([api.get<Ticket[]>('/personnel/tickets'), api.get<Contact[]>('/personnel/contacts')])
      setTickets(ticketItems); setContacts(contactItems); setActiveId(current => current || ticketItems[0]?.id || ''); setForm(current => ({ ...current, recipient_id: current.recipient_id || contactItems[0]?.id || '' }))
    } catch (error) { setError(error instanceof Error ? error.message : 'Impossible de charger les conversations.') }
  }
  useEffect(() => { void load() }, [])

  const active = tickets.find(ticket => ticket.id === activeId) ?? tickets[0]
  const filtered = useMemo(() => tickets.filter(ticket => [ticket.contact, ticket.sujet].some(value => value.toLowerCase().includes(search.toLowerCase()))), [tickets, search])

  async function sendReply() {
    if (!active || !reply.trim()) return
    setError('')
    try { await api.post(`/personnel/tickets/${active.id}/messages`, { message: reply }); setReply(''); await load() }
    catch (error) { setError(error instanceof Error ? error.message : 'Impossible d’envoyer le message.') }
  }
  async function resolve() {
    if (!active) return
    try { await api.patch(`/personnel/tickets/${active.id}`, { statut: 'resolu' }); setNotice('Conversation marquée comme résolue.'); await load() }
    catch (error) { setError(error instanceof Error ? error.message : 'Impossible de modifier la conversation.') }
  }
  async function create() {
    setError('')
    try { await api.post('/personnel/tickets', form); setShowForm(false); setNotice('Message enregistré et envoyé.'); setForm(current => ({ ...current, sujet: '', message: '' })); await load() }
    catch (error) { setError(error instanceof Error ? error.message : 'Impossible de créer la conversation.') }
  }

  return <div>
    <div className="op-page-header"><div><div className="op-breadcrumb"><span>Personnel</span><span className="op-breadcrumb-sep">›</span><span className="op-breadcrumb-active">Messages</span></div><h1 className="op-page-title">Messages & support</h1><p className="op-page-subtitle">Conversations enregistrées dans le centre.</p></div><button className="btn-navy" onClick={() => setShowForm(true)} disabled={!contacts.length}>Nouveau message</button></div>
    {error && <div className="auth-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}{notice && <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#ECFDF5', color: '#047857' }}>{notice}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, minHeight: 560 }}>
      <aside className="op-card" style={{ overflow: 'hidden' }}><div style={{ padding: 12, borderBottom: '1px solid #F1F5F9' }}><input className="search-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher…" style={{ width: '100%' }} /></div>{filtered.length === 0 && <p style={{ padding: 18, color: '#64748B', fontSize: 12 }}>Aucune conversation.</p>}{filtered.map(ticket => <button key={ticket.id} onClick={() => setActiveId(ticket.id)} style={{ width: '100%', padding: 15, border: 0, borderBottom: '1px solid #F1F5F9', borderLeft: ticket.id === active?.id ? '3px solid #1B3A6B' : '3px solid transparent', background: ticket.id === active?.id ? '#EBF0FA' : '#fff', textAlign: 'left', cursor: 'pointer' }}><strong style={{ color: '#0F2347', fontSize: 13 }}>{ticket.contact || 'Conversation'}</strong><span style={{ display: 'block', color: '#64748B', fontSize: 11, marginTop: 4 }}>{ticket.sujet}</span><span className="badge badge-blue" style={{ marginTop: 7 }}>{statusLabels[ticket.statut]}</span></button>)}</aside>
      <section className="op-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{!active ? <p style={{ padding: 24, color: '#64748B' }}>Sélectionnez ou créez une conversation.</p> : <><header className="row-between" style={{ padding: 16, borderBottom: '1px solid #F1F5F9' }}><div><h2 style={{ color: '#0F2347', fontSize: 15 }}>{active.contact || 'Conversation'}</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>{active.sujet}</p></div>{active.statut !== 'resolu' && active.statut !== 'ferme' && <button className="btn btn-outline btn-sm" onClick={resolve}>Marquer résolu</button>}</header><div style={{ flex: 1, padding: 18, background: '#FAFBFC', overflowY: 'auto' }}>{active.messages.map(message => <div key={message.id} style={{ display: 'flex', justifyContent: message.own ? 'flex-end' : 'flex-start', marginBottom: 12 }}><div style={{ maxWidth: '72%' }}><small style={{ display: 'block', textAlign: message.own ? 'right' : 'left', color: '#94A3B8', marginBottom: 4 }}>{message.sender_name} · {new Date(message.created_at).toLocaleString('fr-FR')}</small><p style={{ padding: '10px 13px', borderRadius: 10, background: message.own ? '#1B3A6B' : '#fff', color: message.own ? '#fff' : '#334155', border: message.own ? 0 : '1px solid #E2E8F0', fontSize: 13 }}>{message.message}</p></div></div>)}</div><div style={{ display: 'flex', gap: 10, padding: 14, borderTop: '1px solid #F1F5F9' }}><input className="search-input" value={reply} onChange={event => setReply(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void sendReply() }} placeholder="Écrivez votre réponse…" style={{ flex: 1 }} /><button className="btn-navy" onClick={sendReply} disabled={!reply.trim()}>Envoyer</button></div></>}</section>
    </div>
    {showForm && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(9,24,46,.5)' }}><section className="op-card" style={{ width: '100%', maxWidth: 500, padding: 24 }}><div className="row-between"><h2 style={{ color: '#0F2347' }}>Nouveau message</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Fermer</button></div><div style={{ display: 'grid', gap: 12, marginTop: 18 }}><label style={{ fontSize: 12, color: '#475569' }}>Destinataire<select value={form.recipient_id} onChange={event => setForm(current => ({ ...current, recipient_id: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }}>{contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.nom} — {contact.personnel_fonction ?? contact.role}</option>)}</select></label><label style={{ fontSize: 12, color: '#475569' }}>Sujet<input value={form.sujet} onChange={event => setForm(current => ({ ...current, sujet: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label><label style={{ fontSize: 12, color: '#475569' }}>Message<textarea rows={5} value={form.message} onChange={event => setForm(current => ({ ...current, message: event.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, padding: 10, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button><button className="btn-navy" onClick={create} disabled={!form.recipient_id || form.sujet.trim().length < 2 || !form.message.trim()}>Envoyer</button></div></section></div>}
  </div>
}
