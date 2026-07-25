'use client'

const PAIEMENTS = [
  { nom: 'Ahmed Cherkaoui', groupe: 'Anglais B1', mois: 'Juillet 2025', montant: '450 DH', statut: 'Payé', date: '22 juil.' },
  { nom: 'Fatima Zahra El Idrissi', groupe: 'Français B2', mois: 'Juillet 2025', montant: '680 DH', statut: 'Payé', date: '21 juil.' },
  { nom: 'Karim Ouali', groupe: 'Anglais B2', mois: 'Juillet 2025', montant: '520 DH', statut: 'En attente', date: '—' },
  { nom: 'Sara Benali', groupe: 'Gestion de projet', mois: 'Juillet 2025', montant: '750 DH', statut: 'En retard', date: '—' },
  { nom: 'Omar Tahiri', groupe: 'Marketing digital', mois: 'Juillet 2025', montant: '580 DH', statut: 'En retard', date: '—' },
  { nom: 'Nour El Houda Fassi', groupe: 'Français A2', mois: 'Juillet 2025', montant: '380 DH', statut: 'Payé', date: '10 juil.' },
  { nom: 'Yasmine Ait Ouali', groupe: 'Espagnol déb.', mois: 'Juillet 2025', montant: '420 DH', statut: 'En attente', date: '—' },
  { nom: 'Mehdi Bensouda', groupe: 'Anglais B1', mois: 'Juillet 2025', montant: '450 DH', statut: 'Payé', date: '18 juil.' },
]

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  'Payé': { color: '#059669', bg: 'rgba(5,150,105,.08)' },
  'En attente': { color: '#C9922A', bg: 'rgba(201,146,42,.1)' },
  'En retard': { color: '#DC2626', bg: 'rgba(220,38,38,.07)' },
}

export default function OperateurPaiementsPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Paiements</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Suivi des mensualités de vos apprenants</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
          Enregistrer un paiement
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[{ l: 'Payés', v: 4, c: '#059669' }, { l: 'En attente', v: 2, c: '#C9922A' }, { l: 'En retard', v: 2, c: '#DC2626' }].map(s => (
          <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', border: '1px solid #E2D9CC', flex: 1, boxShadow: '0 1px 6px rgba(27,58,107,.04)' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.5rem', color: s.c, marginBottom: 2 }}>{s.v}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>{s.l} ce mois</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder="Rechercher un apprenant…" style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', outline: 'none', width: 280, background: '#fff' }} />
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option>Tous les statuts</option>
          <option>Payé</option>
          <option>En attente</option>
          <option>En retard</option>
        </select>
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#64748b', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option>Juillet 2025</option>
          <option>Juin 2025</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', borderBottom: '1px solid #E2D9CC' }}>
              {['Apprenant', 'Groupe', 'Mois', 'Montant', 'Statut', 'Date paiement', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAIEMENTS.map((p, i) => {
              const { color, bg } = STATUS_STYLES[p.statut]
              return (
                <tr key={i} style={{ borderBottom: i < PAIEMENTS.length - 1 ? '1px solid #f1ede8' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '13px 18px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.87rem', color: '#1a1823' }}>{p.nom}</td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#64748b' }}>{p.groupe}</td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#64748b' }}>{p.mois}</td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823' }}>{p.montant}</td>
                  <td style={{ padding: '13px 18px' }}><span style={{ display: 'inline-flex', padding: '3px 11px', borderRadius: 99, background: bg, color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem' }}>{p.statut}</span></td>
                  <td style={{ padding: '13px 18px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: '#64748b' }}>{p.date}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.statut !== 'Payé' && <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #1B3A6B', background: '#1B3A6B', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', cursor: 'pointer' }}>Encaisser</button>}
                      <button style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.72rem', color: '#64748b', cursor: 'pointer' }}>Reçu</button>
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
