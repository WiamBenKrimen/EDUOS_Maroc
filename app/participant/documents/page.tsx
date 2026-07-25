'use client'

const DOCS = [
  { nom: 'Attestation_Formation_B1.pdf', type: 'Attestation', date: '30 juin 2025', taille: '280 Ko', icon: '#7C3AED' },
  { nom: 'Certificat_Présence_Juin.pdf', type: 'Certificat de présence', date: '30 juin 2025', taille: '190 Ko', icon: '#059669' },
  { nom: 'Reçu_Paiement_Juin.pdf', type: 'Reçu de paiement', date: '20 juin 2025', taille: '95 Ko', icon: '#C9922A' },
  { nom: 'Reçu_Paiement_Mai.pdf', type: 'Reçu de paiement', date: '18 mai 2025', taille: '95 Ko', icon: '#C9922A' },
  { nom: 'Contrat_Formation_2025.pdf', type: 'Contrat', date: '01 janv. 2025', taille: '340 Ko', icon: '#1B3A6B' },
  { nom: 'Fiche_Inscription.pdf', type: "Fiche d'inscription", date: '01 janv. 2025', taille: '210 Ko', icon: '#64748b' },
]

export default function ParticipantDocumentsPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Mes documents</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Vos attestations, certificats et reçus disponibles au téléchargement</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {DOCS.map((d, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #E2D9CC', boxShadow: '0 2px 12px rgba(27,58,107,.05)', transition: 'transform .2s, box-shadow .2s' }}
            onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(-3px)'; t.style.boxShadow = '0 10px 28px rgba(27,58,107,.1)' }}
            onMouseLeave={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(0)'; t.style.boxShadow = '0 2px 12px rgba(27,58,107,.05)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${d.icon}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={d.icon} strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823', marginBottom: 4, lineHeight: 1.3 }}>{d.nom}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#94a3b8', marginBottom: 16 }}>{d.type} · {d.date} · {d.taille}</div>
            <button style={{ width: '100%', padding: '9px', borderRadius: 9, border: '1.5px solid #1B3A6B', background: '#fff', color: '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
