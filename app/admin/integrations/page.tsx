'use client'
import { useState } from 'react'

interface Integration {
  id: string
  nom: string
  description: string
  statut: 'connected' | 'disconnected' | 'beta'
  icon: string
  color: string
  details?: string
}

const INTEGRATIONS: Integration[] = [
  { id: 'whatsapp', nom: 'WhatsApp Business API', description: 'Envoyez automatiquement des rappels, notifications d\'absence et relances de paiement via WhatsApp.', statut: 'connected', icon: '💬', color: '#059669', details: 'Connecté · +212 6XX XXX XXX · 247 messages ce mois' },
  { id: 'gdrive', nom: 'Google Drive', description: "Synchronisez vos ressources pédagogiques et partagez automatiquement les supports avec les apprenants.", statut: 'connected', icon: '📁', color: '#1B3A6B', details: 'Connecté · 3.4 Go utilisés' },
  { id: 'stripe', nom: 'Stripe Payments', description: 'Acceptez les paiements en ligne par carte bancaire. Remboursements et factures automatiques.', statut: 'beta', icon: '💳', color: '#7C3AED', details: 'Bêta · Disponible Q3 2025' },
  { id: 'zoom', nom: 'Zoom / Google Meet', description: 'Organisez vos sessions live directement depuis EDUOS. Les liens sont envoyés automatiquement aux apprenants.', statut: 'disconnected', icon: '📹', color: '#0369A1' },
  { id: 'sms', nom: 'SMS Gateway (Maroc)', description: 'Envoyez des SMS via Infobip ou un opérateur local pour les relances et rappels critiques.', statut: 'disconnected', icon: '📱', color: '#C9922A' },
  { id: 'email', nom: 'SMTP / Mailgun', description: 'Configurez votre serveur d\'emails pour les rapports, factures et communications officielles.', statut: 'connected', icon: '📧', color: '#059669', details: 'Connecté · no-reply@moncentre.ma' },
  { id: 'zapier', nom: 'Zapier', description: "Connectez EDUOS à plus de 5000 applications via Zapier. Automatisez vos flux de travail.", statut: 'beta', icon: '⚡', color: '#DC2626', details: 'Bêta · API disponible' },
  { id: 'hubspot', nom: 'HubSpot CRM', description: 'Synchronisez vos prospects et apprenants avec HubSpot pour un suivi commercial avancé.', statut: 'disconnected', icon: '🔗', color: '#FF7A59' },
]

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  connected: { label: 'Connecté', color: '#059669', bg: 'rgba(5,150,105,.08)' },
  disconnected: { label: 'Non connecté', color: '#64748b', bg: '#f1f5f9' },
  beta: { label: 'Bêta', color: '#7C3AED', bg: 'rgba(124,58,237,.07)' },
}

export default function IntegrationsPage() {
  const [integ, setInteg] = useState<Integration[]>(INTEGRATIONS)

  function toggle(id: string) {
    setInteg(prev => prev.map(i => i.id === id ? { ...i, statut: i.statut === 'connected' ? 'disconnected' as const : i.statut === 'disconnected' ? 'connected' as const : i.statut } : i))
  }

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Intégrations</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Connectez EDUOS à vos outils préférés</p>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        {[{ l: 'Connectées', v: integ.filter(i => i.statut === 'connected').length, c: '#059669' }, { l: 'Disponibles', v: integ.filter(i => i.statut === 'disconnected').length, c: '#64748b' }, { l: 'En bêta', v: integ.filter(i => i.statut === 'beta').length, c: '#7C3AED' }].map(s => (
          <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', border: '1px solid #E2D9CC', flex: 1, boxShadow: '0 1px 6px rgba(27,58,107,.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.5rem', color: s.c, marginBottom: 2 }}>{s.v}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {integ.map(i => {
          const s = STATUS_LABELS[i.statut]
          return (
            <div key={i.id} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: `1px solid ${i.statut === 'connected' ? 'rgba(5,150,105,.2)' : '#E2D9CC'}`, boxShadow: '0 2px 12px rgba(27,58,107,.05)', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(-2px)'; t.style.boxShadow = '0 8px 24px rgba(27,58,107,.1)' }}
              onMouseLeave={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(0)'; t.style.boxShadow = '0 2px 12px rgba(27,58,107,.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: '1.8rem' }}>{i.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.95rem', color: '#1a1823', marginBottom: 2 }}>{i.nom}</div>
                    <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 99, background: s.bg, color: s.color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.65rem' }}>{s.label}</span>
                  </div>
                </div>
                {i.statut !== 'beta' && (
                  <button onClick={() => toggle(i.id)} style={{ padding: '8px 16px', borderRadius: 9, border: `1.5px solid ${i.statut === 'connected' ? '#E2D9CC' : '#1B3A6B'}`, background: i.statut === 'connected' ? '#fff' : '#1B3A6B', color: i.statut === 'connected' ? '#DC2626' : '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>
                    {i.statut === 'connected' ? 'Déconnecter' : 'Connecter'}
                  </button>
                )}
                {i.statut === 'beta' && <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 8, background: 'rgba(124,58,237,.07)', color: '#7C3AED', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>Bientôt</span>}
              </div>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#64748b', lineHeight: 1.55, marginBottom: i.details ? 12 : 0 }}>{i.description}</p>
              {i.details && <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: i.statut === 'connected' ? '#059669' : '#94a3b8', background: '#faf8f5', padding: '7px 12px', borderRadius: 8 }}>{i.details}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
