'use client'

const LOGS = [
  { utilisateur: 'Youssef El Mansouri', role: 'Directeur', action: 'Inscription créée', cible: 'Ahmed Cherkaoui — Cohorte Anglais B1', ip: '105.66.12.44', date: "Auj. 11:42" },
  { utilisateur: 'Super Admin', role: 'Admin', action: 'Rôle modifié', cible: "Opérateur → permissions mises à jour", ip: '196.12.0.1', date: "Auj. 11:00" },
  { utilisateur: 'Laila Bennouna', role: 'Opérateur', action: 'Attestation générée', cible: 'Sara Benali — Anglais A2', ip: '105.66.12.55', date: "Auj. 10:33" },
  { utilisateur: 'Youssef El Mansouri', role: 'Directeur', action: 'Paiement enregistré', cible: '1 500 MAD — Ahmed Cherkaoui', ip: '105.66.12.44', date: "Auj. 09:55" },
  { utilisateur: 'Super Admin', role: 'Admin', action: 'Utilisateur créé', cible: 'nadia.chraibi@lingua.ma', ip: '196.12.0.1', date: "Hier 17:20" },
  { utilisateur: 'Laila Bennouna', role: 'Opérateur', action: 'Présence enregistrée', cible: 'Cohorte Anglais B1 — 23 jan.', ip: '105.66.12.55', date: "Hier 09:00" },
  { utilisateur: 'Mohammed Idrissi', role: 'Directeur', action: 'Rapport téléchargé', cible: 'Rapport mensuel décembre 2024', ip: '41.248.3.12', date: "22 jan. 15:08" },
  { utilisateur: 'Super Admin', role: 'Admin', action: 'Intégration modifiée', cible: 'WhatsApp Business API — déconnecté', ip: '196.12.0.1', date: "21 jan. 12:30" },
  { utilisateur: 'Karim Alaoui', role: 'Formateur', action: 'Ressource ajoutée', cible: 'Cours_03_Expression_Orale.pdf', ip: '105.70.8.22', date: "21 jan. 10:10" },
  { utilisateur: 'Laila Bennouna', role: 'Opérateur', action: 'Évaluation publiée', cible: 'QCM Grammaire — Cohorte Anglais B1', ip: '105.66.12.55', date: "20 jan. 14:50" },
]

const ACTION_STYLE: Record<string, { color: string; bg: string }> = {
  'Inscription créée': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
  'Rôle modifié': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
  'Attestation générée': { color: '#7C3AED', bg: 'rgba(124,58,237,.07)' },
  'Paiement enregistré': { color: '#C9922A', bg: 'rgba(201,146,42,.09)' },
  'Utilisateur créé': { color: '#1B3A6B', bg: 'rgba(27,58,107,.08)' },
  'Présence enregistrée': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
  'Rapport téléchargé': { color: '#0369A1', bg: 'rgba(3,105,161,.07)' },
  'Intégration modifiée': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
  'Ressource ajoutée': { color: '#7C3AED', bg: 'rgba(124,58,237,.07)' },
  'Évaluation publiée': { color: '#C9922A', bg: 'rgba(201,146,42,.09)' },
}

const ROLE_COLORS: Record<string, string> = { 'Directeur': '#1B3A6B', 'Opérateur': '#059669', 'Formateur': '#7C3AED', 'Participant': '#C9922A', 'Admin': '#DC2626' }

export default function AuditPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Journal d'audit</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Toutes les actions effectuées sur la plateforme</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#fff', color: '#1B3A6B', border: '1.5px solid #E2D9CC', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input placeholder="Rechercher une action…" style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', outline: 'none', width: 280, background: '#fff' }} />
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.8rem', color: '#64748b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
          <option>Tous les rôles</option>
          <option>Directeur</option>
          <option>Opérateur</option>
          <option>Formateur</option>
          <option>Admin</option>
        </select>
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.8rem', color: '#64748b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
          <option>Toutes les dates</option>
          <option>Aujourd'hui</option>
          <option>7 derniers jours</option>
          <option>30 derniers jours</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['Utilisateur', 'Rôle', 'Action', 'Cible', 'Adresse IP', 'Date & Heure'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LOGS.map((log, i) => {
              const as = ACTION_STYLE[log.action] ?? { color: '#64748b', bg: '#f1f5f9' }
              return (
                <tr key={i} style={{ borderBottom: i < LOGS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${ROLE_COLORS[log.role] ?? '#64748b'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.72rem', color: ROLE_COLORS[log.role] ?? '#64748b', flexShrink: 0 }}>{log.utilisateur.charAt(0)}</div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#1a1823' }}>{log.utilisateur}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 99, background: `${ROLE_COLORS[log.role] ?? '#64748b'}12`, color: ROLE_COLORS[log.role] ?? '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.68rem' }}>{log.role}</span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: as.bg, color: as.color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#475569', maxWidth: 260 }}>{log.cible}</td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{log.ip}</td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#94a3b8' }}>{log.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ padding: '14px 18px', borderTop: '1px solid #f1ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#94a3b8' }}>Affichage de 10 sur 247 entrées</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['←', '1', '2', '3', '…', '25', '→'].map(p => (
              <button key={p} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2D9CC', background: p === '1' ? '#1B3A6B' : '#fff', color: p === '1' ? '#fff' : '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.78rem', cursor: 'pointer' }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
