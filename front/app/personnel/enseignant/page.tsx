import Link from 'next/link'

const seances = [
  { heure: '09:00', cours: 'Français professionnel', groupe: 'Groupe FP-02', salle: 'Salle 3', statut: 'À venir' },
  { heure: '11:30', cours: 'Communication écrite', groupe: 'Groupe CE-01', salle: 'Salle 5', statut: 'À venir' },
  { heure: '15:00', cours: 'Préparation à l’examen', groupe: 'Groupe PE-04', salle: 'En ligne', statut: 'À préparer' },
]

export default function EnseignantPage() {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div><p style={{ color: '#94A3B8', fontSize: 12 }}>Espace enseignant</p><h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Bonjour Nadia</h1><p style={{ color: '#64748B', fontSize: 13 }}>Retrouvez vos séances, les présences à valider et les évaluations en cours.</p></div>
        <Link href="/personnel/enseignant/presence" className="btn-navy" style={{ textDecoration: 'none' }}>Faire l’appel</Link>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 22 }}>
        {[['Séances aujourd’hui', '3', '6 h de cours'], ['Apprenants', '48', '3 groupes'], ['Présences à valider', '1', 'Avant 18:00'], ['Copies à corriger', '12', 'Échéance vendredi']].map(([label,value,detail]) => <article key={label} style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}><span style={{ color: '#64748B', fontSize: 11 }}>{label}</span><strong style={{ display: 'block', color: '#0F2347', fontSize: 23, margin: '7px 0 3px' }}>{value}</strong><small style={{ color: '#A56D0B' }}>{detail}</small></article>)}
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .8fr', gap: 18 }}>
        <section style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: 18, borderBottom: '1px solid #F1F5F9' }}><div><h2 style={{ color: '#0F2347', fontSize: 16 }}>Programme du jour</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>Mercredi 29 juillet 2026</p></div><Link href="/personnel/enseignant/planning" style={{ color: '#1B3A6B', fontSize: 12, fontWeight: 700 }}>Planning complet</Link></header>
          {seances.map(s => <div key={s.heure} style={{ display: 'grid', gridTemplateColumns: '.5fr 1.4fr 1fr .7fr', gap: 12, padding: 16, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}><strong style={{ color: '#1B3A6B' }}>{s.heure}</strong><span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{s.cours}</strong><small style={{ color: '#64748B' }}>{s.groupe}</small></span><small style={{ color: '#64748B' }}>{s.salle}</small><span style={{ color: '#047857', fontSize: 11, fontWeight: 700 }}>{s.statut}</span></div>)}
        </section>
        <aside style={{ padding: 18, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff' }}><h2 style={{ color: '#0F2347', fontSize: 16 }}>Actions pédagogiques</h2><div style={{ display: 'grid', gap: 9, marginTop: 15 }}>{[['Déposer une ressource','/personnel/enseignant/ressources'],['Saisir des notes','/personnel/enseignant/notes'],['Écrire au coordinateur','/personnel/enseignant/messages']].map(([label,href]) => <Link key={label} href={href} style={{ padding: 13, borderRadius: 9, background: '#F8FAFC', color: '#1B3A6B', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{label}<span style={{ float: 'right' }}>›</span></Link>)}</div></aside>
      </div>
    </div>
  )
}
