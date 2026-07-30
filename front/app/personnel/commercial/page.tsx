import Link from 'next/link'

const prospects = [
  { nom: 'Imane Zahra', formation: 'Anglais B2', etape: 'À rappeler', date: 'Aujourd’hui, 14:30' },
  { nom: 'Mehdi Amrani', formation: 'Développement web', etape: 'Dossier reçu', date: 'Aujourd’hui, 11:20' },
  { nom: 'Salma Raji', formation: 'Gestion de projet', etape: 'Nouveau', date: 'Hier, 16:45' },
]

export default function CommercialPage() {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div><p style={{ color: '#94A3B8', fontSize: 12 }}>Espace commercial</p><h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Bonjour Omar</h1><p style={{ color: '#64748B', fontSize: 13 }}>Voici les opportunités et les encaissements à suivre aujourd’hui.</p></div>
        <Link href="/personnel/commercial/prospects" className="btn-navy" style={{ textDecoration: 'none' }}>Ajouter un prospect</Link>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
        {[['Nouveaux prospects', '18', '+4 cette semaine'], ['À relancer', '7', '3 prioritaires'], ['Inscriptions', '12', 'Ce mois'], ['Montant encaissé', '46 800 DH', '+12 % vs juin']].map(([label,value,detail]) => <article key={label} style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}><span style={{ color: '#64748B', fontSize: 11 }}>{label}</span><strong style={{ display: 'block', color: '#0F2347', fontSize: 23, margin: '7px 0 3px' }}>{value}</strong><small style={{ color: '#16805D' }}>{detail}</small></article>)}
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .8fr', gap: 18 }}>
        <section style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: 18, borderBottom: '1px solid #F1F5F9' }}><div><h2 style={{ color: '#0F2347', fontSize: 16 }}>Prospects récents</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>Les prochaines actions commerciales.</p></div><Link href="/personnel/commercial/prospects" style={{ color: '#1B3A6B', fontSize: 12, fontWeight: 700 }}>Voir tout</Link></header>
          {prospects.map(p => <div key={p.nom} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr .8fr', gap: 12, padding: 16, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}><span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{p.nom}</strong><small style={{ color: '#64748B' }}>{p.formation}</small></span><span style={{ color: '#92400E', fontSize: 11, fontWeight: 700 }}>{p.etape}</span><small style={{ color: '#94A3B8' }}>{p.date}</small></div>)}
        </section>
        <aside style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}><h2 style={{ color: '#0F2347', fontSize: 16 }}>Actions rapides</h2><div style={{ display: 'grid', gap: 9, marginTop: 15 }}>{[['Créer une inscription','/personnel/commercial/inscriptions'],['Consulter les paiements','/personnel/commercial/paiements'],['Relancer les prospects','/personnel/commercial/prospects']].map(([label,href]) => <Link key={label} href={href} style={{ padding: 13, borderRadius: 9, background: '#F8FAFC', color: '#1B3A6B', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{label}<span style={{ float: 'right' }}>›</span></Link>)}</div></aside>
      </div>
    </div>
  )
}
