'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { api } from '@/lib/api-client'

type Contact = { id: string; nom: string; telephone: string; role: string; matricule: string }
type WaStatus = { configured: boolean; state: string; qr_code?: string; instance_name?: string; error?: string }

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
      // Poll every 4 seconds while scanning QR code
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

  if (loading) return (
    <div style={{ padding: '14px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#94A3B8', fontSize: 13 }}>Vérification de la connexion WhatsApp…</span>
    </div>
  )

  if (!status?.configured) return (
    <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, marginBottom: 20 }}>
      <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 600 }}>⚠️ Evolution API n'est pas configurée sur le serveur.</span>
    </div>
  )

  // CONNECTED
  if (status.state === 'open') return (
    <div style={{ padding: '14px 18px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#065F46', fontSize: 14 }}>WhatsApp connecté</p>
          <p style={{ margin: 0, color: '#059669', fontSize: 12 }}>Vous pouvez envoyer des messages directement depuis EDUOS.</p>
        </div>
      </div>
      <button onClick={handleDisconnect} disabled={disconnecting} style={{ padding: '7px 14px', fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
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
          <p style={{ marginTop: 14, color: '#94A3B8', fontSize: 12 }}>🔄 Le QR Code se rafraîchit automatiquement toutes les 4 secondes.</p>
          <button onClick={fetchStatus} style={{ marginTop: 10, padding: '8px 16px', fontSize: 12, color: '#0F2347', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, cursor: 'pointer' }}>
            🔄 Rafraîchir le QR Code
          </button>
        </div>
      </div>
    </div>
  )

  // NOT CREATED / DISCONNECTED — show connect button
  return (
    <div style={{ padding: '18px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>💬</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#0F2347', fontSize: 14 }}>WhatsApp non connecté</p>
          <p style={{ margin: 0, color: '#64748B', fontSize: 12 }}>Associez votre numéro WhatsApp pour envoyer des messages depuis EDUOS.</p>
        </div>
      </div>
      <button onClick={handleConnect} disabled={connecting} style={{ flexShrink: 0, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', background: connecting ? '#94A3B8' : '#25D366', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
        {connecting ? '⏳ Préparation…' : '📱 Connecter WhatsApp'}
      </button>
    </div>
  )
}

export default function DirectorMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recipientId, setRecipientId] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [waConnected, setWaConnected] = useState(false)

  useEffect(() => {
    api.get<Contact[]>('/director/whatsapp/contacts')
      .then(setContacts)
      .catch(e => setError(e instanceof Error ? e.message : 'Impossible de charger les contacts.'))
  }, [])

  const filtered = useMemo(() => contacts.filter(c =>
    `${c.nom} ${c.telephone} ${c.matricule}`.toLowerCase().includes(query.toLowerCase())
  ), [contacts, query])
  const selected = contacts.find(c => c.id === recipientId)

  async function send(event: React.FormEvent) {
    event.preventDefault()
    setError(''); setNotice('')
    if (!recipientId || !message.trim()) return setError('Choisissez un destinataire et écrivez un message.')
    setBusy(true)
    try {
      await api.post('/director/whatsapp/messages', { recipient_id: recipientId, message: message.trim() })
      setNotice(`✅ Message envoyé à ${selected?.nom ?? 'ce contact'}.`)
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: 0, color: '#64748B', fontWeight: 800, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>Espace directeur</p>
        <h1 style={{ margin: '5px 0', color: '#0F2347', fontSize: 27 }}>Messages WhatsApp</h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Envoyez des messages directement depuis EDUOS via WhatsApp.</p>
      </header>

      {/* WhatsApp Connection Widget */}
      <WhatsAppConnectionWidget onConnected={() => setWaConnected(true)} />

      {error && <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
      {notice && <div style={{ marginBottom: 16, padding: '12px 14px', color: '#166534', background: '#ECFDF5', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>{notice}</div>}

      {/* Messaging Interface — only shown when connected */}
      {waConnected ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,.8fr) minmax(0,1.4fr)', gap: 18 }}>
          <section style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#0F2347' }}>Destinataires</strong>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un contact" style={{ width: '100%', boxSizing: 'border-box', marginTop: 10, padding: '9px 10px', border: '1px solid #CBD5E1', borderRadius: 8 }} />
            </div>
            <div style={{ maxHeight: 430, overflowY: 'auto' }}>
              {filtered.map(contact => (
                <button key={contact.id} onClick={() => setRecipientId(contact.id)} style={{ display: 'block', textAlign: 'left', width: '100%', padding: '12px 14px', cursor: 'pointer', border: 0, borderBottom: '1px solid #F1F5F9', background: recipientId === contact.id ? '#EFF6FF' : '#fff' }}>
                  <strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{contact.nom}</strong>
                  <small style={{ color: '#64748B' }}>{contact.telephone} · {contact.role === 'participant' ? 'Apprenant' : 'Personnel'}</small>
                </button>
              ))}
              {!filtered.length && <p style={{ padding: 16, color: '#64748B', fontSize: 13 }}>Aucun contact avec numéro WhatsApp.</p>}
            </div>
          </section>

          <form onSubmit={send} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20 }}>
            <p style={{ margin: 0, color: '#64748B', fontSize: 12 }}>Destinataire</p>
            <h2 style={{ margin: '5px 0 20px', fontSize: 18, color: '#0F2347' }}>
              {selected ? `${selected.nom} · ${selected.telephone}` : 'Sélectionnez un contact'}
            </h2>
            <label style={{ display: 'block', color: '#334155', fontWeight: 700, fontSize: 13 }}>
              Votre message
              <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={4096} placeholder="Bonjour, …" rows={9} style={{ display: 'block', boxSizing: 'border-box', resize: 'vertical', width: '100%', marginTop: 8, padding: 12, border: '1px solid #CBD5E1', borderRadius: 9, font: 'inherit' }} />
            </label>
            <div style={{ marginTop: 8, color: '#94A3B8', textAlign: 'right', fontSize: 12 }}>{message.length}/4096</div>
            <button className="btn-navy" disabled={busy || !recipientId || !message.trim()} type="submit" style={{ marginTop: 18 }}>
              {busy ? 'Envoi en cours…' : '📤 Envoyer sur WhatsApp'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#F8FAFC', borderRadius: 14, border: '1px dashed #CBD5E1' }}>
          <p style={{ fontSize: 40, margin: '0 0 12px' }}>📲</p>
          <p style={{ color: '#64748B', fontSize: 15, margin: 0 }}>Connectez votre WhatsApp ci-dessus pour commencer à envoyer des messages.</p>
        </div>
      )}
    </div>
  )
}
