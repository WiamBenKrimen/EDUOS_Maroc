'use client'

const USERS = [
  { nom: 'Youssef El Mansouri', email: 'y.mansouri@avenir-fes.ma', role: 'Directeur', centre: 'Avenir Fès', statut: 'Actif', dernierLogin: 'Auj. 09:41' },
  { nom: 'Laila Bennouna', email: 'l.bennouna@avenir-fes.ma', role: 'Opérateur', centre: 'Avenir Fès', statut: 'Actif', dernierLogin: 'Auj. 08:15' },
  { nom: 'Karim Alaoui', email: 'k.alaoui@avenir-fes.ma', role: 'Formateur', centre: 'Avenir Fès', statut: 'Actif', dernierLogin: 'Hier 18:30' },
  { nom: 'Ahmed Cherkaoui', email: 'a.cherkaoui@gmail.com', role: 'Participant', centre: 'Avenir Fès', statut: 'Actif', dernierLogin: 'Auj. 10:02' },
  { nom: 'Sara Benali', email: 's.benali@gmail.com', role: 'Participant', centre: 'Avenir Fès', statut: 'Actif', dernierLogin: 'Il y a 2j' },
  { nom: 'Mohammed Idrissi', email: 'm.idrissi@lingua.ma', role: 'Directeur', centre: 'Centre Lingua Rabat', statut: 'Actif', dernierLogin: 'Auj. 07:55' },
  { nom: 'Nadia Chraibi', email: 'n.chraibi@lingua.ma', role: 'Opérateur', centre: 'Centre Lingua Rabat', statut: 'Inactif', dernierLogin: 'Il y a 5j' },
  { nom: 'Super Admin', email: 'admin@eduos.ma', role: 'Admin', centre: '—', statut: 'Actif', dernierLogin: 'Auj. 11:00' },
]

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  'Directeur': { color: '#1B3A6B', bg: 'rgba(27,58,107,.08)' },
  'Opérateur': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
  'Formateur': { color: '#7C3AED', bg: 'rgba(124,58,237,.07)' },
  'Participant': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  'Admin': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
}

export default function UtilisateursPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Utilisateurs</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Gérez tous les comptes utilisateurs de la plateforme</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvel utilisateur
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input placeholder="Rechercher un utilisateur…" style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', outline: 'none', width: 300, background: '#fff' }} />
        {['Tous', 'Directeur', 'Opérateur', 'Formateur', 'Participant', 'Admin'].map(r => (
          <button key={r} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E2D9CC', background: r === 'Tous' ? '#1B3A6B' : '#fff', color: r === 'Tous' ? '#fff' : '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>{r}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['Nom', 'Email', 'Rôle', 'Centre', 'Statut', 'Dernier accès', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => {
              const { color, bg } = ROLE_STYLES[u.role] ?? { color: '#64748b', bg: '#f1f5f9' }
              return (
                <tr key={i} style={{ borderBottom: i < USERS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.82rem', color, flexShrink: 0 }}>{u.nom.charAt(0)}</div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823' }}>{u.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '13px 18px' }}><span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: bg, color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{u.role}</span></td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#64748b' }}>{u.centre}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: u.statut === 'Actif' ? 'rgba(5,150,105,.08)' : '#f1f5f9', color: u.statut === 'Actif' ? '#059669' : '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{u.statut}</span>
                  </td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#94a3b8' }}>{u.dernierLogin}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#1B3A6B', cursor: 'pointer' }}>Éditer</button>
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#DC2626', cursor: 'pointer' }}>Désactiver</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
