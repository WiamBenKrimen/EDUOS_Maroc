'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
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

interface AttachmentPayload {
  type: 'audio' | 'image' | 'file'
  file_url: string
  file_name: string
  file_size?: number
  duration?: number
  caption?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseAttachment(body: string): AttachmentPayload | null {
  if (!body || typeof body !== 'string' || !body.trim().startsWith('{')) return null
  try {
    const data = JSON.parse(body)
    if (data && typeof data === 'object' && data.type && data.file_url) {
      return data as AttachmentPayload
    }
  } catch {
    return null
  }
  return null
}

function formatLastMessageSnippet(body: string | null): string {
  if (!body) return 'Aucun message'
  const att = parseAttachment(body)
  if (att) {
    if (att.type === 'audio') return '🎤 Message vocal'
    if (att.type === 'image') return '📷 Photo'
    if (att.type === 'file') return `📎 ${att.file_name}`
  }
  return body
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(sec?: number): string {
  if (!sec) return '0:00'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function initials(nom: string, prenom: string): string {
  return `${(prenom?.[0] ?? '').toUpperCase()}${(nom?.[0] ?? '').toUpperCase()}`
}

function roleDisplay(user: { role: RoleLabel; personnel_fonction: string | null }): string {
  if (user.role === 'personnel' && user.personnel_fonction) return user.personnel_fonction
  const map: Record<string, string> = {
    directeur: 'Directeur',
    coordinateur: 'Coordinateur',
    formateur: 'Formateur',
    enseignant: 'Enseignant',
    commercial: 'Commercial',
    participant: 'Participant',
  }
  return map[user.role] ?? user.role
}

function roleClass(role: RoleLabel): string {
  const r = role.toLowerCase()
  if (r.includes('directeur')) return styles.roleDirecteur
  if (r.includes('formateur')) return styles.roleFormateur
  if (r.includes('enseignant')) return styles.roleEnseignant
  if (r.includes('coordinateur')) return styles.roleCoordinateur
  if (r.includes('commercial')) return styles.roleCommercial
  if (r.includes('participant')) return styles.roleParticipant
  return styles.roleDefault
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

// ── Audio Player Component ───────────────────────────────────────────────────

function AudioMessagePlayer({ payload, isSent }: { payload: AttachmentPayload; isSent: boolean }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  return (
    <div className={styles.audioBubbleContainer}>
      <audio
        ref={audioRef}
        src={payload.file_url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        className={styles.audioPlayBtn}
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Lecture'}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        )}
      </button>

      <div className={styles.audioWaveform}>
        {[8, 14, 18, 10, 16, 20, 12, 6, 14, 18, 10, 15].map((h, idx) => (
          <span
            key={idx}
            className={`${styles.audioBar}${playing ? ' ' + styles.audioBarPlaying : ''}`}
            style={{ height: playing ? undefined : h, animationDelay: `${idx * 0.08}s` }}
          />
        ))}
      </div>

      <span className={styles.audioTime}>
        {formatDuration(payload.duration)}
      </span>
    </div>
  )
}

// ── Main ChatWidget Component ────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
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

  // Attachments & Voice Note states
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stagedAttachment, setStagedAttachment] = useState<AttachmentPayload | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Broadcast window events
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('eduos:chat-state', { detail: { open } }))
  }, [open])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('eduos:unread-count', { detail: { count: totalUnread } }))
  }, [totalUnread])

  // Listen for trigger events
  useEffect(() => {
    const handleToggle = () => setOpen(o => !o)
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ partnerId?: string }>
      setOpen(true)
      if (customEvent.detail?.partnerId) {
        const found = users.find(u => u.id === customEvent.detail.partnerId)
        if (found) setActivePartner(found)
      }
    }
    const handleClose = () => setOpen(false)

    window.addEventListener('eduos:toggle-chat', handleToggle)
    window.addEventListener('eduos:open-chat', handleOpen)
    window.addEventListener('eduos:close-chat', handleClose)

    return () => {
      window.removeEventListener('eduos:toggle-chat', handleToggle)
      window.removeEventListener('eduos:open-chat', handleOpen)
      window.removeEventListener('eduos:close-chat', handleClose)
    }
  }, [users])

  useEffect(() => {
    setCurrentUserId(getCurrentUserId())
  }, [])

  // Badge count polling
  useEffect(() => {
    const fetchBadge = () => {
      api.get<{ total: number }>('/chat/unread-count')
        .then(data => setTotalUnread(data.total))
        .catch(() => {})
    }
    fetchBadge()
    const timer = setInterval(fetchBadge, 12_000)
    return () => clearInterval(timer)
  }, [])

  // Load contacts
  useEffect(() => {
    if (!open) return
    api.get<CentreUser[]>('/chat/users').then(setUsers).catch(() => {})
    api.get<Conversation[]>('/chat/conversations').then(setConversations).catch(() => {})
  }, [open])

  // Load active messages
  const loadMessages = useCallback(async (partnerId: string) => {
    setLoadingMessages(true)
    try {
      const msgs = await api.get<ChatMessage[]>(`/chat/messages/${partnerId}`)
      setMessages(msgs)
      await api.patch(`/chat/messages/${partnerId}/read`, {})
      const badge = await api.get<{ total: number }>('/chat/unread-count')
      setTotalUnread(badge.total)
      setConversations(prev =>
        prev.map(c => (c.partner_id === partnerId ? { ...c, unread_count: 0 } : c))
      )
    } catch {
      // silent
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (!activePartner) return
    loadMessages(activePartner.id)
  }, [activePartner, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime polling
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
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          }
          return msgs
        })
        await api.patch(`/chat/messages/${partnerId}/read`, {})
      } catch {
        // ignore
      }
    }, 3_000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activePartner, open])

  // ── Voice Recording Methods ──
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordingTime(0)

      recordTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch {
      alert("Impossible d'accéder au microphone pour enregistrer un message vocal.")
    }
  }

  function stopAndSendRecording() {
    if (!mediaRecorderRef.current || !recording) return
    const mediaRecorder = mediaRecorderRef.current
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        const payload: AttachmentPayload = {
          type: 'audio',
          file_url: dataUrl,
          file_name: `vocal_${Date.now()}.webm`,
          duration: recordingTime,
        }
        void handleSend(JSON.stringify(payload))
      }
      reader.readAsDataURL(audioBlob)

      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    mediaRecorder.stop()
    cleanupRecordingState()
  }

  function cancelRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    cleanupRecordingState()
  }

  function cleanupRecordingState() {
    setRecording(false)
    setRecordingTime(0)
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
  }

  // ── File and Image Pickers ──
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setStagedAttachment({
        type: isImage ? 'image' : 'file',
        file_url: dataUrl,
        file_name: file.name,
        file_size: file.size,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Send Message Routine ──
  async function handleSend(customBody?: string) {
    if (!activePartner || sending) return
    let contentToSend = customBody ?? body.trim()

    if (stagedAttachment && !customBody) {
      contentToSend = JSON.stringify({
        ...stagedAttachment,
        caption: body.trim() || undefined,
      })
    }

    if (!contentToSend) return
    setSending(true)

    try {
      const msg = await api.post<ChatMessage>('/chat/messages', {
        recipient_id: activePartner.id,
        body: contentToSend,
      })
      setMessages(prev => [...prev, msg])
      setBody('')
      setStagedAttachment(null)

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
    setStagedAttachment(null)
  }

  // Contacts Filtering
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      roleDisplay(u).toLowerCase().includes(q)
    )
  })

  const convPartnerIds = new Set(conversations.map(c => c.partner_id))
  const convUsers: CentreUser[] = conversations
    .map(c => users.find(u => u.id === c.partner_id))
    .filter((u): u is CentreUser => !!u)

  const otherUsers = filteredUsers.filter(u => !convPartnerIds.has(u.id))
  const orderedContacts = search
    ? filteredUsers
    : [...convUsers.filter(u => {
        const q = search.toLowerCase()
        return u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q)
      }), ...otherUsers]

  function unreadFor(userId: string): number {
    return conversations.find(c => c.partner_id === userId)?.unread_count ?? 0
  }

  // ── Render Bubble Content ──
  function renderBubbleContent(msg: ChatMessage, isSent: boolean) {
    const attachment = parseAttachment(msg.body)

    if (!attachment) {
      return <div className={styles.bubbleText}>{msg.body}</div>
    }

    if (attachment.type === 'audio') {
      return <AudioMessagePlayer payload={attachment} isSent={isSent} />
    }

    if (attachment.type === 'image') {
      return (
        <div className={styles.imageBubbleContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className={styles.imageAttachment}
            onClick={() => setLightboxUrl(attachment.file_url)}
          />
          {attachment.caption && <div className={styles.bubbleText}>{attachment.caption}</div>}
        </div>
      )
    }

    if (attachment.type === 'file') {
      return (
        <div className={styles.imageBubbleContainer}>
          <a
            href={attachment.file_url}
            download={attachment.file_name}
            className={styles.fileBubbleContainer}
            title={`Télécharger ${attachment.file_name}`}
          >
            <div className={styles.fileIconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className={styles.fileDetails}>
              <div className={styles.fileName}>{attachment.file_name}</div>
              <div className={styles.fileSize}>{formatFileSize(attachment.file_size)}</div>
            </div>
            <span className={styles.fileDownloadBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </span>
          </a>
          {attachment.caption && <div className={styles.bubbleText}>{attachment.caption}</div>}
        </div>
      )
    }

    return <div className={styles.bubbleText}>{msg.body}</div>
  }

  // ── Render Timeline ──
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
          <div className={styles.emptyIconWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span>Aucun message. Envoyez une note ou un vocal pour démarrer la discussion !</span>
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
          {renderBubbleContent(msg, isSent)}
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

  return (
    <>
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={e => handleFileSelect(e, false)}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFileSelect(e, true)}
      />

      {/* Lightbox Modal for Images */}
      {lightboxUrl && (
        <div className={styles.lightboxModal} onClick={() => setLightboxUrl(null)}>
          <button className={styles.lightboxCloseBtn} onClick={() => setLightboxUrl(null)} aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Agrandissement" className={styles.lightboxImage} />
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        id="chat-widget-trigger"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat interne EDUOS'}
        title="Chat Interne EDUOS MAROC"
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

      {/* Main Chat Drawer Panel */}
      {open && (
        <div
          className={`${styles.panel}${expanded ? ' ' + styles.panelExpanded : ''}`}
          role="dialog"
          aria-label="Chat Interne EDUOS"
        >
          {/* Contacts Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarHeaderIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span className={styles.sidebarTitle}>Contacts</span>
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
                <div className={styles.noContacts}>Aucun contact trouvé</div>
              ) : (
                orderedContacts.map(user => {
                  const unread = unreadFor(user.id)
                  const isActive = activePartner?.id === user.id
                  const isGoldRole = user.role === 'directeur' || user.role === 'coordinateur'
                  const lastMsg = conversations.find(c => c.partner_id === user.id)?.last_body

                  return (
                    <button
                      key={user.id}
                      id={`chat-contact-${user.id}`}
                      className={`${styles.contactItem}${isActive ? ' ' + styles.active : ''}`}
                      onClick={() => selectPartner(user)}
                      title={`${user.prenom} ${user.nom} — ${roleDisplay(user)}`}
                    >
                      <div className={styles.contactAvatarWrapper}>
                        <div className={`${styles.contactAvatar}${isGoldRole ? ' ' + styles.goldRole : ''}`}>
                          {initials(user.nom, user.prenom)}
                        </div>
                        <div className={styles.statusDot} title="En ligne" />
                      </div>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactName}>{user.prenom} {user.nom}</div>
                        <div className={`${styles.contactRole} ${roleClass(user.role)}`}>
                          {roleDisplay(user)}
                        </div>
                        {lastMsg && (
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatLastMessageSnippet(lastMsg)}
                          </div>
                        )}
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

          {/* Conversation Workspace */}
          <div className={styles.chatArea}>
            {!activePartner ? (
              <div className={styles.noConv}>
                <div className={styles.emptyIconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: '#0F2347', display: 'block', fontSize: '0.9rem' }}>Chat Interne EDUOS</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Sélectionnez un membre de votre centre pour échanger en direct
                  </p>
                </div>
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
                      <div className={styles.chatHeaderSub}>
                        <span className={styles.chatHeaderRoleTag}>{roleDisplay(activePartner)}</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>•</span>
                        <span style={{ color: '#10B981', fontSize: '0.65rem', fontWeight: 600 }}>Disponible</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.headerActions}>
                    <button
                      className={styles.headerBtn}
                      onClick={() => setExpanded(e => !e)}
                      aria-label={expanded ? 'Réduire' : 'Agrandir'}
                      title={expanded ? 'Réduire le chat' : 'Agrandir le chat'}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {expanded ? (
                          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/>
                        ) : (
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        )}
                      </svg>
                    </button>
                    <button
                      className={styles.headerBtn}
                      onClick={() => setActivePartner(null)}
                      aria-label="Fermer la conversation"
                      title="Fermer la conversation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Message Timeline */}
                <div id="chat-messages-container" className={styles.messages}>
                  {renderMessages()}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Container */}
                <div className={styles.inputContainer}>
                  {/* Staged Attachment Banner */}
                  {stagedAttachment && (
                    <div className={styles.attachmentPreviewBanner}>
                      <div className={styles.attachmentPreviewContent}>
                        {stagedAttachment.type === 'image' && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={stagedAttachment.file_url} alt="Aperçu" className={styles.attachmentPreviewThumb} />
                        )}
                        {stagedAttachment.type === 'file' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9922A" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        )}
                        <span className={styles.attachmentPreviewText}>{stagedAttachment.file_name}</span>
                      </div>
                      <button className={styles.attachmentCancelBtn} onClick={() => setStagedAttachment(null)} title="Annuler">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Recording Bar (Active Voice Note Mode) */}
                  {recording ? (
                    <div className={styles.recordingBar}>
                      <div className={styles.recordingStatus}>
                        <span className={styles.recordingDot} />
                        <span>Enregistrement vocal… ({formatDuration(recordingTime)})</span>
                      </div>
                      <div className={styles.recordingActions}>
                        <button className={styles.recordingCancelBtn} onClick={cancelRecording}>
                          Annuler
                        </button>
                        <button className={styles.recordingSendBtn} onClick={stopAndSendRecording}>
                          Envoyer
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Input Row */
                    <div className={styles.inputArea}>
                      <div className={styles.inputActions}>
                        {/* Audio Recorder Trigger */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={startRecording}
                          title="Enregistrer un message vocal"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                          </svg>
                        </button>

                        {/* Image Attachment Trigger */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => imageInputRef.current?.click()}
                          title="Joindre une photo"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </button>

                        {/* Document Attachment Trigger */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => fileInputRef.current?.click()}
                          title="Joindre un fichier / document"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                          </svg>
                        </button>
                      </div>

                      <textarea
                        id="chat-message-input"
                        ref={textareaRef}
                        className={styles.messageInput}
                        placeholder={stagedAttachment ? "Légende (optionnelle)…" : `Message à ${activePartner.prenom}…`}
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
                        disabled={(!body.trim() && !stagedAttachment) || sending}
                        aria-label="Envoyer"
                        title="Envoyer (Entrée)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                          <path d="M22 2 11 13"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
