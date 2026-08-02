'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api-client'

type Contact = { id: string; nom: string; telephone: string; role: string; matricule: string }
type WaStatus = { configured: boolean; state: string; qr_code?: string; instance_name?: string; error?: string }
type ChatMessage = { id: string; centre_id: string; recipient_id: string; direction: 'sent' | 'received'; message: string; created_at: string }

function WhatsAppConnectionWidget({ onConnected }: { onConnected: () => void }) {
  const [status, setStatus] = useState<WaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const s = await api.get<WaStatus>('/director/whatsapp/status')
      setStatus(s)
      if (s.state === 'open') {
        onConnected()
        if (pollInterval) { clearInterval(pollInterval); setPollInterval(null) }
      }
    } catch {
      setStatus({ configured: false, state: 'error' })
    } finally {
      setLoading(false)
    }
  }, [onConnected, pollInterval])

  useEffect(() => {
    fetchStatus()
    return () => { if (pollInterval) clearInterval(pollInterval) }
  }, []) // eslint-disable-line

  async function handleConnect() {
    setConnecting(true)
    try {
      const res = await api.post<WaStatus>('/director/whatsapp/connect', {})
      setStatus(res)
      const interval = setInterval(fetchStatus, 4000)
      setPollInterval(interval)
    } catch (e) {
      setStatus(prev => ({ ...prev!, state: 'error', error: e instanceof Error ? e.message : 'Erreur' }))
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await api.post('/director/whatsapp/disconnect', {})
      setStatus(prev => ({ ...prev!, state: 'disconnected', qr_code: undefined }))
    } catch { /* ignore */ }
    finally { setDisconnecting(false) }
  }

  if (loading) return null

  if (!status?.configured) return (
    <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, marginBottom: 16 }}>
      <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 600 }}>⚠️ Evolution API n'est pas configurée sur le serveur.</span>
    </div>
  )

  // CONNECTED - Compact banner
  if (status.state === 'open') return (
    <div style={{ padding: '10px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🟢</span>
        <span style={{ fontWeight: 700, color: '#065F46', fontSize: 13 }}>WhatsApp Connecté</span>
        <span style={{ color: '#059669', fontSize: 12 }}>· Prêt pour envoyer et recevoir des messages et fichiers en direct</span>
      </div>
      <button onClick={handleDisconnect} disabled={disconnecting} style={{ padding: '5px 12px', fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        {disconnecting ? 'Déconnexion…' : 'Déconnecter'}
      </button>
    </div>
  )

  // SHOW QR CODE for scanning
  if ((status.state === 'connecting' || status.state === 'disconnected') && status.qr_code) return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>📱</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#0F2347', fontSize: 15 }}>Connectez votre WhatsApp</p>
          <p style={{ margin: 0, color: '#64748B', fontSize: 12 }}>Scannez ce QR Code avec votre téléphone pour associer votre numéro WhatsApp à EDUOS.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 28, padding: 24, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, border: '3px solid #25D366', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <img src={status.qr_code} alt="QR Code WhatsApp" style={{ display: 'block', width: 200, height: 200 }} />
        </div>
        <div>
          <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 2.1, color: '#334155', fontSize: 14 }}>
            <li>Ouvrez <strong>WhatsApp</strong> sur votre téléphone</li>
            <li>Allez dans <strong>Paramètres</strong> → <strong>Appareils liés</strong></li>
            <li>Appuyez sur <strong>"Associer un appareil"</strong></li>
            <li>Scannez le QR Code à gauche 👈</li>
          </ol>
          <p style={{ marginTop: 14, color: '#94A3B8', fontSize: 12 }}>🔄 Le QR Code se rafraîchit automatiquement.</p>
        </div>
      </div>
    </div>
  )

  // DISCONNECTED BUTTON
  return (
    <div style={{ padding: '16px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>💬</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#0F2347', fontSize: 14 }}>WhatsApp non connecté</p>
          <p style={{ margin: 0, color: '#64748B', fontSize: 12 }}>Associez votre WhatsApp pour discuter avec vos apprenants et personnels.</p>
        </div>
      </div>
      <button onClick={handleConnect} disabled={connecting} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', background: connecting ? '#94A3B8' : '#25D366', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
        {connecting ? '⏳ Préparation…' : '📱 Connecter WhatsApp'}
      </button>
    </div>
  )
}

export default function DirectorMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recipientId, setRecipientId] = useState('')
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [waConnected, setWaConnected] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch contacts
  useEffect(() => {
    api.get<Contact[]>('/director/whatsapp/contacts')
      .then(res => {
        const list = Array.isArray(res) ? res : []
        setContacts(list)
        if (list.length > 0 && !recipientId) setRecipientId(list[0].id)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Impossible de charger les contacts.'))
  }, []) // eslint-disable-line

  // Fetch & Poll chat history for active contact
  const fetchChatHistory = useCallback(async (contactId: string) => {
    if (!contactId) return
    try {
      const history = await api.get<ChatMessage[]>(`/director/whatsapp/messages/${contactId}`)
      setChatMessages(Array.isArray(history) ? history : [])
    } catch {
      /* ignore background poll error */
    }
  }, [])

  useEffect(() => {
    if (!recipientId) return
    fetchChatHistory(recipientId)

    const timer = setInterval(() => {
      fetchChatHistory(recipientId)
    }, 3000)

    return () => clearInterval(timer)
  }, [recipientId, fetchChatHistory])

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const filtered = useMemo(() => contacts.filter(c =>
    `${c.nom} ${c.telephone} ${c.matricule}`.toLowerCase().includes(query.toLowerCase())
  ), [contacts, query])

  const selected = contacts.find(c => c.id === recipientId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 20 * 1024 * 1024) {
        setError('Le fichier dépasse la limite de 20 Mo.')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!recipientId) return
    if (!message.trim() && !selectedFile) return
    
    setBusy(true)
    const textToSend = message.trim()
    const fileToSend = selectedFile

    setMessage('')
    setSelectedFile(null)

    // Optimistic UI update
    const displayMsg = fileToSend ? `📎 [${fileToSend.name}]${textToSend ? '\n' + textToSend : ''}` : textToSend
    const tempMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      centre_id: '',
      recipient_id: recipientId,
      direction: 'sent',
      message: displayMsg,
      created_at: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, tempMsg])

    try {
      if (fileToSend) {
        // Send file + caption
        const formData = new FormData()
        formData.append('recipient_id', recipientId)
        formData.append('caption', textToSend)
        formData.append('file', fileToSend)

        await api.postForm('/director/whatsapp/media', formData)
      } else {
        // Send text message
        await api.post('/director/whatsapp/messages', { recipient_id: recipientId, message: textToSend })
      }
      fetchChatHistory(recipientId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible.')
      setChatMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      setMessage(textToSend)
      setSelectedFile(fileToSend)
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function formatTime(iso?: string) {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const safeMessages = Array.isArray(chatMessages) ? chatMessages : []

  return (
    <div style={{ width: '100%', maxWidth: 1150 }}>
      <header style={{ marginBottom: 14 }}>
        <p style={{ margin: 0, color: '#64748B', fontWeight: 800, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>Espace directeur</p>
        <h1 style={{ margin: '3px 0', color: '#0F2347', fontSize: 24 }}>Messages WhatsApp</h1>
      </header>

      {/* WhatsApp Connection Widget */}
      <WhatsAppConnectionWidget onConnected={() => setWaConnected(true)} />

      {error && <div className="auth-error" role="alert" style={{ marginBottom: 12 }}>{error}</div>}

      {/* REAL WHATSAPP WEB CHAT INTERFACE */}
      {waConnected ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 620, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          
          {/* LEFT SIDEBAR: CONTACTS LIST */}
          <section style={{ borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', background: '#F8FAFC', height: '100%', minHeight: 0 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', background: '#fff', flexShrink: 0 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#0F2347', fontWeight: 700 }}>Discussions</h3>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="🔍 Rechercher un contact..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 13, background: '#F1F5F9' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map(contact => {
                const isSelected = recipientId === contact.id
                return (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setRecipientId(contact.id)
                      fetchChatHistory(contact.id)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      border: 0,
                      borderBottom: '1px solid #F1F5F9',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: isSelected ? '#25D366' : '#0F2347', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {contact.nom.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', color: '#0F2347', fontSize: 14, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{contact.nom}</strong>
                      <small style={{ color: '#64748B', fontSize: 12 }}>{contact.telephone} · {contact.role === 'participant' ? 'Apprenant' : 'Personnel'}</small>
                    </div>
                  </button>
                )
              })}
              {!filtered.length && <p style={{ padding: 20, color: '#64748B', fontSize: 13, textAlign: 'center' }}>Aucun contact trouvé.</p>}
            </div>
          </section>

          {/* RIGHT PANEL: CHAT WINDOW */}
          {selected ? (
            <section style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#E5DDD5' }}>
              
              {/* CHAT HEADER */}
              <div style={{ padding: '12px 20px', background: '#F0F2F5', borderBottom: '1px solid #D1D7DB', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {selected.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, color: '#111B21', fontWeight: 700 }}>{selected.nom}</h2>
                  <p style={{ margin: 0, color: '#667781', fontSize: 12 }}>📱 {selected.telephone} · {selected.role === 'participant' ? 'Apprenant' : 'Personnel'}</p>
                </div>
              </div>

              {/* MESSAGES THREAD (WHATSAPP BUBBLES) */}
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10, backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                {safeMessages.map(msg => {
                  const isSent = msg.direction === 'sent'
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isSent ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: isSent ? '#E7FFDB' : '#FFFFFF',
                        borderRadius: isSent ? '12px 12px 0px 12px' : '12px 12px 12px 0px',
                        padding: '9px 14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                        position: 'relative',
                      }}
                    >
                      <p style={{ margin: 0, color: '#111B21', fontSize: 14, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {msg.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: '#667781' }}>{formatTime(msg.created_at)}</span>
                        {isSent && <span style={{ fontSize: 12, color: '#53BDEB' }}>✓✓</span>}
                      </div>
                    </div>
                  )
                })}

                {!safeMessages.length && (
                  <div style={{ margin: 'auto', textAlign: 'center', background: '#FFF3C4', color: '#543900', padding: '12px 20px', borderRadius: 10, fontSize: 13, maxWidth: 380, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                    💬 Écrivez votre message ou joignez un fichier pour <strong>{selected.nom}</strong> ci-dessous.
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ATTACHMENT PREVIEW BAR (IF FILE SELECTED) */}
              {selectedFile && (
                <div style={{ padding: '8px 16px', background: '#E2E8F0', borderTop: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#0F2347', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <strong>{selectedFile.name}</strong>
                    <span style={{ color: '#64748B', fontSize: 12 }}>({(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo)</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#DC2626', fontWeight: 700, fontSize: 16 }}>
                    ✕
                  </button>
                </div>
              )}

              {/* CHAT INPUT BAR */}
              <form onSubmit={send} style={{ padding: '12px 16px', background: '#F0F2F5', borderTop: '1px solid #D1D7DB', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,archive/zip,audio/*,video/*"
                />

                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Joindre un fichier (Images, PDF, Documents...)"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: selectedFile ? '#25D366' : '#E2E8F0',
                    color: selectedFile ? '#fff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  📎
                </button>

                {/* Text Message Input */}
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={selectedFile ? `Ajouter une légende à ${selectedFile.name}...` : `Message à ${selected.nom}...`}
                  disabled={busy}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #CBD5E1',
                    borderRadius: 24,
                    fontSize: 14,
                    outline: 'none',
                    background: '#fff',
                  }}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={busy || (!message.trim() && !selectedFile)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: busy || (!message.trim() && !selectedFile) ? '#94A3B8' : '#25D366',
                    color: '#fff',
                    border: 'none',
                    cursor: busy || (!message.trim() && !selectedFile) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  🚀
                </button>
              </form>
            </section>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', background: '#F8FAFC' }}>
              Sélectionnez une discussion à gauche pour commencer.
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #CBD5E1' }}>
          <p style={{ fontSize: 44, margin: '0 0 12px' }}>💬</p>
          <h3 style={{ color: '#0F2347', margin: '0 0 6px' }}>Interface WhatsApp Web</h3>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Connectez votre compte WhatsApp ci-dessus pour discuter en direct avec vos apprenants et personnels.</p>
        </div>
      )}
    </div>
  )
}
