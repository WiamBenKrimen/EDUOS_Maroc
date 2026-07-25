'use client'

import Link from 'next/link'

const FORMATEURS = [
  { nom: 'Karim Alaoui', specialite: 'Langues — Anglais', groupes: 3, sessions: 24, note: 4.8 },
  { nom: 'Laila Bennouna', specialite: 'Langues — Français', groupes: 2, sessions: 18, note: 4.9 },
  { nom: 'Omar El Fassi', specialite: 'Langues — Espagnol & Arabe', groupes: 2, sessions: 12, note: 4.7 },
  { nom: 'Sanae Tahiri', specialite: 'Management & Gestion de projet', groupes: 1, sessions: 16, note: 4.6 },
  { nom: 'Youssef Chraibi', specialite: 'Marketing digital & Réseaux sociaux', groupes: 1, sessions: 10, note: 4.5 },
  { nom: 'Nadia Rami', specialite: 'Anglais intensif & TOEFL', groupes: 2, sessions: 20, note: 5.0 },
]

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.floor(n) ? '#C9922A' : '#E2D9CC'}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.72rem', color: '#64748b', marginLeft: 4 }}>{n.toFixed(1)}</span>
    </div>
  )
}

export default function FormateursPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Formateurs</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Gérez votre équipe pédagogique</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/directeur/formateurs/remunerations" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: '1.5px solid #E2D9CC', borderRadius: 10, color: '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.84rem', textDecoration: 'none', background: '#fff' }}>
            Rémunérations
          </Link>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter un formateur
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {FORMATEURS.map((f, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '26px', border: '1px solid #E2D9CC', boxShadow: '0 2px 12px rgba(27,58,107,.05)', transition: 'transform .2s, box-shadow .2s' }}
            onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(-3px)'; t.style.boxShadow = '0 10px 30px rgba(27,58,107,.1)' }}
            onMouseLeave={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(0)'; t.style.boxShadow = '0 2px 12px rgba(27,58,107,.05)' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #1B3A6B, #2a5298)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#fff', flexShrink: 0 }}>
                {f.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.95rem', color: '#1a1823', marginBottom: 2 }}>{f.nom}</div>
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.75rem', color: '#64748b', lineHeight: 1.4 }}>{f.specialite}</div>
              </div>
            </div>

            <Stars n={f.note} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '18px 0' }}>
              {[{ label: 'Groupes', val: f.groupes }, { label: 'Sessions ce mois', val: f.sessions }].map(s => (
                <div key={s.label} style={{ background: '#faf8f5', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.3rem', color: '#1B3A6B', marginBottom: 2 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.7rem', color: '#94a3b8' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid #1B3A6B', background: '#fff', color: '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.75rem', cursor: 'pointer' }}>Voir le profil</button>
              <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2D9CC', background: '#faf8f5', color: '#64748b', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>Éditer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
