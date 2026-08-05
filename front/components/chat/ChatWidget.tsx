'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api-client'
import styles from './chat.module.css'

// ── Types ────────────────────────────────────────────────────────────────────

type RoleLabel =
  | 'directeur'
  | 'coordinateur'
  | 'formateur'
  | 'enseignant'
  | 'commercial'
  | 'participant'
  | string

interface CentreUser {
  id: string
  nom: string
  prenom: string
  role: RoleLabel
  personnel_fonction: string | null
  last_login_at: string | null
}

interface Conversation {
  partner_id: string
  nom: string
  prenom: string
  role: RoleLabel
  personnel_fonction: string | null
  last_body: string | null
  last_at: string | null
  last_sender_id: string | null
  last_read_at: string | null
  unread_count: number
}

interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at: string | null
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(nom: string, prenom: string): string {
  return `${(prenom?.[0] ?? '').toUpperCase()}${(nom?.[0] ?? '').toUpperCase()}`
}

function roleDisplay(user: { role: RoleLabel; personnel_fonction: string | null }): string {
  if (user.role === 'personnel' && user.personnel_fonction) return user.personnel_fonction
  return user.role
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('eduos_user')
    if (!raw) return null
    return (JSON.parse(raw) as { id?: string })?.id ?? null
  } catch {
    return null
  }
}

// ── ChatWidget ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<CentreUser[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activePartner, setActivePartner] = useState<CentreUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [search, setSearch] = useState('')
  const [totalUnread, setTotalUnread] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Init ──
  useEffect(() => {
    setCurrentUserId(getCurrentUserId())
  }, [])

  // ── Badge non-lus (polling léger toutes les 15s) ──
  useEffect(() => {
    const fetchBadge = () => {
      api.get<{ total: number }>('/chat/unread-count')
        .then(data => setTotalUnread(data.total))
        .catch(() => {})
    }
    fetchBadge()
    const timer = setInterval(fetchBadge, 15_000)
    return () => clearInterval(timer)
  }, [])

  // ── Load contacts + conversations when panel opens ──
  useEffect(() => {
    if (!open) return
    api.get<CentreUser[]>('/chat/users').then(setUsers).catch(() => {})
    api.get<Conversation[]>('/chat/conversations').then(setConversations).catch(() => {})
  }, [open])

  // ── Load messages for active partner ──
  const loadMessages = useCallback(async (partnerId: string) => {
    setLoadingMessages(true)
    try {
      const msgs = await api.get<ChatMessage[]>(`/chat/messages/${partnerId}`)
      setMessages(msgs)
      // Mark as read
      await api.patch(`/chat/messages/${partnerId}/read`, {})
      // Update badge
      const badge = await api.get<{ total: number }>('/chat/unread-count')
      setTotalUnread(badge.total)
      // Update conversation list unread
      setConversations(prev =>
        prev.map(c => c.partner_id === partnerId ? { ...c, unread_count: 0 } : c)
      )
    } catch {
      // silently fail
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (!activePartner) return
    loadMessages(activePartner.id)
  }, [activePartner, loadMessages])

  // ── Scroll to bottom when messages change ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Polling every 3s while a conversation is open ──
  useEffect(() => {
    if (!activePartner || !open) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    const partnerId = activePartner.id
    pollRef.current = setInterval(async () => {
      try {
        const msgs = await api.get<ChatMessage[]>(`/chat/messages/${partnerId}`)
        setMessages(prev => {
          if (prev.length !== msgs.length) {
            // scroll only when new messages
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          }
          return msgs
        })
        // Auto-mark read
        await api.patch(`/chat/messages/${partnerId}/read`, {})
      } catch {
        // ignore
      }
    }, 3_000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activePartner, open])

  // ── Send message ──
  async function handleSend() {
    if (!activePartner || !body.trim() || sending) return
    setSending(true)
    try {
      const msg = await api.post<ChatMessage>('/chat/messages', {
        recipient_id: activePartner.id,
        body: body.trim(),
      })
      setMessages(prev => [...prev, msg])
      setBody('')
      // Update conversations last message
      setConversations(prev => {
        const existing = prev.find(c => c.partner_id === activePartner.id)
        if (existing) {
          return [
            { ...existing, last_body: msg.body, last_at: msg.created_at, last_sender_id: currentUserId, last_read_at: null },
            ...prev.filter(c => c.partner_id !== activePartner.id),
          ]
        }
        return [
          {
            partner_id: activePartner.id,
            nom: activePartner.nom,
            prenom: activePartner.prenom,
            role: activePartner.role,
            personnel_fonction: activePartner.personnel_fonction,
            last_body: msg.body,
            last_at: msg.created_at,
            last_sender_id: currentUserId,
            last_read_at: null,
            unread_count: 0,
          },
          ...prev,
        ]
      })
      textareaRef.current?.focus()
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  function selectPartner(user: CentreUser) {
    setActivePartner(user)
    setMessages([])
  }

  // ── Filtered contacts (search + conversations enriched with users) ──
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      roleDisplay(u).toLowerCase().includes(q)
    )
  })

  // Merge conversations into contact list so recent conversations appear first
  const convPartnerIds = new Set(conversations.map(c => c.partner_id))
  const convUsers: CentreUser[] = conversations
    .map(c => users.find(u => u.id === c.partner_id))
    .filter((u): u is CentreUser => !!u)

  const otherUsers = filteredUsers.filter(u => !convPartnerIds.has(u.id))
  const orderedContacts = search
    ? filteredUsers
    : [...convUsers.filter(u => {
        const q = search.toLowerCase()
        return (
          u.nom.toLowerCase().includes(q) ||
          u.prenom.toLowerCase().includes(q)
        )
      }), ...otherUsers]

  function unreadFor(userId: string): number {
    return conversations.find(c => c.partner_id === userId)?.unread_count ?? 0
  }

  // ── Render messages with day separators ──
  function renderMessages() {
    if (loadingMessages) {
      return (
        <div className={styles.loadingMsg}>
          <div className={styles.spinner} />
        </div>
      )
    }
    if (!messages.length) {
      return (
        <div className={styles.emptyChat}>
          <span className={styles.emptyChatIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span>Aucun message. Commencez la conversation !</span>
        </div>
      )
    }

    const items: React.ReactNode[] = []
    let lastDay = ''

    messages.forEach((msg, i) => {
      const day = formatDay(msg.created_at)
      if (day !== lastDay) {
        lastDay = day
        items.push(
          <div key={`sep-${i}`} className={styles.daySeparator}>
            <div className={styles.daySeparatorLine} />
            <span className={styles.daySeparatorText}>{day}</span>
            <div className={styles.daySeparatorLine} />
          </div>
        )
      }
      const isSent = msg.sender_id === currentUserId
      items.push(
        <div key={msg.id} className={`${styles.messageBubble} ${isSent ? styles.sent : styles.received}`}>
          <div className={styles.bubbleText}>{msg.body}</div>
          <div className={styles.bubbleMeta}>
            <span>{formatTime(msg.created_at)}</span>
            {isSent && msg.read_at && (
              <span className={styles.readTick} title="Lu">✓✓</span>
            )}
            {isSent && !msg.read_at && (
              <span title="Envoyé">✓</span>
            )}
          </div>
        </div>
      )
    })
    return items
  }

  // ── JSX ──
  return (
    <>
      {/* Floating trigger button */}
      <button
        id="chat-widget-trigger"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
        title="Chat interne EDUOS"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && totalUnread > 0 && (
          <span className={styles.triggerBadge}>{totalUnread > 99 ? '99+' : totalUnread}</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Chat interne EDUOS">
          {/* Sidebar contacts */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className={styles.sidebarTitle}>Messages</span>
            </div>

            <div className={styles.searchBox}>
              <input
                id="chat-search-input"
                className={styles.searchInput}
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.contactList}>
              {orderedContacts.length === 0 ? (
                <div className={styles.noContacts}>Aucun contact</div>
              ) : (
                orderedContacts.map(user => {
                  const unread = unreadFor(user.id)
                  const isActive = activePartner?.id === user.id
                  return (
                    <button
                      key={user.id}
                      id={`chat-contact-${user.id}`}
                      className={`${styles.contactItem}${isActive ? ' ' + styles.active : ''}`}
                      onClick={() => selectPartner(user)}
                      title={`${user.prenom} ${user.nom} — ${roleDisplay(user)}`}
                    >
                      <div className={styles.contactAvatar}>
                        {initials(user.nom, user.prenom)}
                      </div>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactName}>{user.prenom}</div>
                        <div className={styles.contactRole}>{roleDisplay(user)}</div>
                      </div>
                      {unread > 0 && (
                        <span className={styles.contactUnread}>{unread}</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </aside>

          {/* Chat area */}
          <div className={styles.chatArea}>
            {!activePartner ? (
              <div className={styles.noConv}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Sélectionnez un contact pour démarrer une conversation
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className={styles.chatHeader}>
                  <div className={styles.chatHeaderUser}>
                    <div className={styles.chatHeaderAvatar}>
                      {initials(activePartner.nom, activePartner.prenom)}
                    </div>
                    <div>
                      <div className={styles.chatHeaderName}>
                        {activePartner.prenom} {activePartner.nom}
                      </div>
                      <div className={styles.chatHeaderRole}>
                        {roleDisplay(activePartner)}
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setActivePartner(null)}
                    aria-label="Fermer la conversation"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* Messages */}
                <div id="chat-messages-container" className={styles.messages}>
                  {renderMessages()}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={styles.inputArea}>
                  <textarea
                    id="chat-message-input"
                    ref={textareaRef}
                    className={styles.messageInput}
                    placeholder={`Message à ${activePartner.prenom}…`}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    maxLength={2000}
                  />
                  <button
                    id="chat-send-btn"
                    className={styles.sendBtn}
                    onClick={() => void handleSend()}
                    disabled={!body.trim() || sending}
                    aria-label="Envoyer le message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                      <path d="M22 2 11 13"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
