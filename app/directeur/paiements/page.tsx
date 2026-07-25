'use client'

import Link from 'next/link'

const RECENT = [
  { nom: 'Ahmed Cherkaoui', formation: 'Anglais B1', montant: '450 DH', date: '22 juil. 2025', mode: 'Virement', statut: 'Payé' },
  { nom: 'Fatima Zahra El Idrissi', formation: 'Français B2', montant: '680 DH', date: '21 juil. 2025', mode: 'Espèces', statut: 'Payé' },
  { nom: 'Karim Ouali', formation: 'Anglais B2', montant: '520 DH', date: '20 juil. 2025', mode: 'Virement', statut: 'Payé' },
  { nom: 'Sara Benali', formation: 'Gestion de projet', montant: '750 DH', date: '18 juil. 2025', mode: 'Chèque', statut: 'En attente' },
  { nom: 'Omar Tahiri', formation: 'Marketing digital', montant: '580 DH', date: '15 juil. 2025', mode: 'Espèces', statut: 'En retard' },
  { nom: 'Nour El Houda Fassi', formation: 'Français A2', montant: '380 DH', date: '10 juil. 2025', mode: 'Virement', statut: 'Payé' },
]

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    'Payé': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
    'En attente': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
    'En retard': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
  }
  const { color, bg } = map[s] ?? { color: '#64748b', bg: '#f1f5f9' }
  return <span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: bg, color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{s}</span>
}

export default function PaiementsPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Paiements</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Suivi des encaissements et mensualités</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/directeur/paiements/relances" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: '1.5px solid #E2D9CC', borderRadius: 10, color: '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.84rem', textDecoration: 'none', background: '#fff' }}>
            Relances auto
          </Link>
          <Link href="/directeur/paiements/factures" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.84rem', textDecoration: 'none' }}>
            Voir les factures
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total encaissé ce mois', val: '84 500 DH', sub: '178 paiements', color: '#059669', bg: 'rgba(5,150,105,.07)' },
          { label: 'Montant en attente', val: '12 350 DH', sub: '28 apprenants concernés', color: '#C9922A', bg: 'rgba(201,146,42,.08)' },
          { label: 'En retard (> 5 jours)', val: '6 200 DH', sub: '12 apprenants', color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid #E2D9CC', boxShadow: '0 2px 10px rgba(27,58,107,.05)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, marginBottom: 14 }}/>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#1a1823', marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.8rem', color: '#64748b', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.73rem', color: s.color, fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#1a1823' }}>Paiements récents</h2>
          <input placeholder="Rechercher…" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', outline: 'none', width: 200 }} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5' }}>
              {['Apprenant', 'Formation', 'Montant', 'Date', 'Mode', 'Statut', ''].map(h => (
                <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT.map((r, i) => (
              <tr key={i} style={{ borderBottom: i < RECENT.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.86rem', color: '#1a1823' }}>{r.nom}</td>
                <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b' }}>{r.formation}</td>
                <td style={{ padding: '13px 20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823' }}>{r.montant}</td>
                <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b' }}>{r.date}</td>
                <td style={{ padding: '13px 20px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b' }}>{r.mode}</td>
                <td style={{ padding: '13px 20px' }}><StatusBadge s={r.statut} /></td>
                <td style={{ padding: '13px 20px' }}>
                  <button style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#1B3A6B', cursor: 'pointer' }}>Reçu</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
