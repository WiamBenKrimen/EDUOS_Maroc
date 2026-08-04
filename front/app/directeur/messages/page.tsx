'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api-client'

type Contact = { id: string; nom: string; telephone: string; role: string; matricule: string }
type WaStatus = { configured: boolean; state: string; qr_code?: string; instance_name?: string; error?: string }
type ChatMessage = { id: string; centre_id: string; recipient_id: string; direction: 'sent' | 'received'; message: string; created_at: string }

function AudioPlayer({ url }: { url?: string }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function onTimeUpdate() {
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    function onLoadedData() {
      if (audio) setDuration(audio.duration)
    }
    function onEnded() {
      setPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadeddata', onLoadedData)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadeddata', onLoadedData)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  function formatTime(secs: number) {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div style={{ minWidth: 230, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
      {url && <audio ref={audioRef} src={url} preload="metadata" />}
      
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!url}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#0284C7',
          color: '#fff',
          border: 'none',
          cursor: url ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      {/* Waveform & Progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 6, width: '100%', background: 'rgba(0,0,0,0.12)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#0284C7', transition: 'width 0.1s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#667781', fontWeight: 600 }}>
          <span>🎤 Message vocal</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

function RenderMessageContent({ text }: { text: string }) {
  // Check if message is Audio: "🎵 [Message vocal](http://...)" or "🎵 [Audio](http://...)"
  const audioUrlMatch = text.match(/^🎵\s*\[(.*?)\]\((.*?)\)$/)
  if (audioUrlMatch) {
    const url = audioUrlMatch[2]
    return <AudioPlayer url={url} />
  }

  // Check if message is a simple audio tag without URL
  if (text.includes('[Message vocal]') || text.includes('🎵')) {
    return <AudioPlayer />
  }

  // Check if message is a document with URL: "📎 [filename.pdf](http://...)\nLégende..."
  const docUrlMatch = text.match(/^📎\s*\[(.*?)\]\((.*?)\)(?:\n([\s\S]*))?$/)
  const docSimpleMatch = !docUrlMatch ? text.match(/^📎\s*\[(.*?)\](?:\n([\s\S]*))?$/) : null

  if (docUrlMatch || docSimpleMatch) {
    const filename = docUrlMatch ? docUrlMatch[1] : docSimpleMatch![1]
    const url = docUrlMatch ? docUrlMatch[2] : null
    const caption = docUrlMatch ? docUrlMatch[3] : docSimpleMatch![2]
    const ext = filename.split('.').pop()?.toUpperCase() || 'DOC'
    const isPdf = ext === 'PDF'

    function handleOpen() {
      if (url) {
        window.open(url, '_blank')
      }
    }

    return (
      <div style={{ minWidth: 240 }}>
        <div
          onClick={handleOpen}
          title={url ? "Cliquer pour ouvrir le document" : filename}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(0,0,0,0.05)',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.08)',
            marginBottom: caption ? 6 : 0,
            cursor: url ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              width: 38,
              height: 44,
              borderRadius: 8,
              background: isPdf ? '#EF4444' : '#0284C7',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>📄</span>
            <span style={{ fontSize: 9, marginTop: 2, textTransform: 'uppercase' }}>{ext}</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <strong
              style={{
                display: 'block',
                fontSize: 13,
                color: '#111B21',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontWeight: 700,
              }}
            >
              {filename}
            </strong>
            <small style={{ color: '#667781', fontSize: 11, fontWeight: 500 }}>
              Document {ext} {url ? '· 👁️ Ouvrir / Télécharger' : ''}
            </small>
          </div>

          {url && (
            <div style={{ fontSize: 18, color: '#0F2347', flexShrink: 0, opacity: 0.7 }}>
              📥
            </div>
          )}
        </div>

        {caption && (
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#111B21', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
            {caption}
          </p>
        )}
      </div>
    )
  }

  // Check if message is a photo with URL: "📷 [Photo](http://...)\nLégende..."
  const photoUrlMatch = text.match(/^📷\s*\[Photo\]\((.*?)\)(?:\n([\s\S]*))?$/)
  if (photoUrlMatch) {
    const url = photoUrlMatch[1]
    const caption = photoUrlMatch[2]
    return (
      <div style={{ minWidth: 220 }}>
        <div
          onClick={() => window.open(url, '_blank')}
          style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <img src={url} alt="Photo WhatsApp" style={{ display: 'block', maxWidth: 280, maxHeight: 320, width: '100%', objectFit: 'cover' }} />
        </div>
        {caption && <p style={{ margin: '6px 0 0', fontSize: 14, color: '#111B21' }}>{caption}</p>}
      </div>
    )
  }

  const photoSimpleMatch = text.match(/^📷\s*\[Photo\](?:\n([\s\S]*))?$/)
  if (photoSimpleMatch) {
    const caption = photoSimpleMatch[1]
    return (
      <div style={{ minWidth: 200 }}>
        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#0F2347', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🖼️</span> Photo envoyée sur WhatsApp
        </div>
        {caption && <p style={{ margin: '6px 0 0', fontSize: 14, color: '#111B21' }}>{caption}</p>}
      </div>
    )
  }

  return (
    <p style={{ margin: 0, color: '#111B21', fontSize: 14, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {text}
    </p>
  )
}

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

  if (status.state === 'open') return (
    <div style={{ padding: '10px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🟢</span>
        <span style={{ fontWeight: 700, color: '#065F46', fontSize: 13 }}>WhatsApp Connecté</span>
        <span style={{ color: '#059669', fontSize: 12 }}>· Prêt pour envoyer et recevoir des messages, vocaux et fichiers</span>
      </div>
      <button onClick={handleDisconnect} disabled={disconnecting} style={{ padding: '5px 12px', fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        {disconnecting ? 'Déconnexion…' : 'Déconnecter'}
      </button>
    </div>
  )

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

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Voice recording functions
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingSeconds(0)

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1)
      }, 1000)
    } catch {
      setError('Accès au microphone refusé ou non disponible.')
    }
  }

  function cancelRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    setIsRecording(false)
    setRecordingSeconds(0)
    audioChunksRef.current = []
  }

  async function stopAndSendRecording() {
    if (!mediaRecorderRef.current || !isRecording) return
    setBusy(true)

    mediaRecorderRef.current.onstop = async () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
      setIsRecording(false)
      setRecordingSeconds(0)

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const audioFile = new File([audioBlob], `vocal_${Date.now()}.webm`, { type: 'audio/webm' })

      // Send recording
      try {
        const formData = new FormData()
        formData.append('recipient_id', recipientId)
        formData.append('caption', '')
        formData.append('file', audioFile)

        await api.postForm('/director/whatsapp/media', formData)
        fetchChatHistory(recipientId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Envoi du message vocal impossible.')
      } finally {
        setBusy(false)
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
      }
    }

    mediaRecorderRef.current.stop()
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
        const formData = new FormData()
        formData.append('recipient_id', recipientId)
        formData.append('caption', textToSend)
        formData.append('file', fileToSend)

        await api.postForm('/director/whatsapp/media', formData)
      } else {
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

  function formatSeconds(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
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
                        maxWidth: '75%',
                        background: isSent ? '#E7FFDB' : '#FFFFFF',
                        borderRadius: isSent ? '12px 12px 0px 12px' : '12px 12px 12px 0px',
                        padding: '9px 14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                        position: 'relative',
                      }}
                    >
                      <RenderMessageContent text={msg.message} />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: '#667781' }}>{formatTime(msg.created_at)}</span>
                        {isSent && <span style={{ fontSize: 12, color: '#53BDEB' }}>✓✓</span>}
                      </div>
                    </div>
                  )
                })}

                {!safeMessages.length && (
                  <div style={{ margin: 'auto', textAlign: 'center', background: '#FFF3C4', color: '#543900', padding: '12px 20px', borderRadius: 10, fontSize: 13, maxWidth: 380, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                    💬 Écrivez votre message, enregistrez un vocal 🎙️ ou joignez un fichier pour <strong>{selected.nom}</strong>.
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

                {isRecording ? (
                  /* VOICE RECORDING BAR */
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', padding: '6px 16px', borderRadius: 24, border: '1px solid #FECACA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#DC2626', fontWeight: 700, fontSize: 14 }}>
                      <span style={{ animation: 'pulse 1s infinite', fontSize: 16 }}>🔴</span>
                      <span>Enregistrement… ({formatSeconds(recordingSeconds)})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={cancelRecording} style={{ border: 0, background: 'transparent', color: '#64748B', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '4px 8px' }}>
                        Annuler ✕
                      </button>
                      <button type="button" onClick={stopAndSendRecording} disabled={busy} style={{ border: 0, background: '#25D366', color: '#fff', borderRadius: 16, padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        {busy ? 'Envoi…' : 'Envoyer 🚀'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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

                    {/* Microphone Recording Button */}
                    <button
                      type="button"
                      onClick={startRecording}
                      title="Enregistrer un message vocal"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: '#E2E8F0',
                        color: '#0F2347',
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
                      🎙️
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
                  </>
                )}
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
