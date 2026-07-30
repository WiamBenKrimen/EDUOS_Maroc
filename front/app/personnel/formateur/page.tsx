import Link from 'next/link'

const formations = [
  { titre: 'Développement web Full Stack', groupe: 'DEV-2026-A', progression: 'Module 6 sur 10', prochain: 'Aujourd’hui, 10:00' },
  { titre: 'Gestion de projet Agile', groupe: 'AGILE-04', progression: 'Module 3 sur 8', prochain: 'Aujourd’hui, 14:00' },
  { titre: 'Excel avancé', groupe: 'EXCEL-12', progression: 'Module 7 sur 7', prochain: 'Demain, 09:00' },
]

export default function FormateurPage() {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div><p style={{ color: '#94A3B8', fontSize: 12 }}>Espace formateur</p><h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Bonjour Karim</h1><p style={{ color: '#64748B', fontSize: 13 }}>Pilotez vos formations, vos groupes et les actions pédagogiques à réaliser.</p></div>
        <Link href="/personnel/formateur/ressources" className="btn-navy" style={{ textDecoration: 'none' }}>Ajouter une ressource</Link>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
        {[['Formations actives', '3', 'Cette période'], ['Apprenants suivis', '64', '5 groupes'], ['Heures ce mois', '42 h', 'Sur 56 h prévues'], ['Évaluations', '9', 'À corriger']].map(([label,value,detail]) => <article key={label} style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}><span style={{ color: '#64748B', fontSize: 11 }}>{label}</span><strong style={{ display: 'block', color: '#0F2347', fontSize: 23, margin: '7px 0 3px' }}>{value}</strong><small style={{ color: '#A56D0B' }}>{detail}</small></article>)}
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .8fr', gap: 18 }}>
        <section style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: 18, borderBottom: '1px solid #F1F5F9' }}><div><h2 style={{ color: '#0F2347', fontSize: 16 }}>Mes formations</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>Progression des parcours qui vous sont affectés.</p></div><Link href="/personnel/formateur/planning" style={{ color: '#1B3A6B', fontSize: 12, fontWeight: 700 }}>Voir le planning</Link></header>
          {formations.map(f => <div key={f.titre} style={{ display: 'grid', gridTemplateColumns: '1.4fr .8fr 1fr', gap: 12, padding: 16, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}><span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{f.titre}</strong><small style={{ color: '#64748B' }}>{f.groupe}</small></span><span style={{ color: '#475569', fontSize: 11 }}>{f.progression}</span><small style={{ color: '#1B3A6B', fontWeight: 700 }}>{f.prochain}</small></div>)}
        </section>
        <aside style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}><h2 style={{ color: '#0F2347', fontSize: 16 }}>À faire</h2><div style={{ display: 'grid', gap: 9, marginTop: 15 }}>{[['Valider les présences','/personnel/formateur/presence'],['Corriger les évaluations','/personnel/formateur/evaluations'],['Répondre aux messages','/personnel/formateur/messages']].map(([label,href]) => <Link key={label} href={href} style={{ padding: 13, borderRadius: 9, background: '#F8FAFC', color: '#1B3A6B', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{label}<span style={{ float: 'right' }}>›</span></Link>)}</div></aside>
      </div>
    </div>
  )
}
