import Link from 'next/link'

type PersonnelDashboardProps = {
  fonction: 'Commercial' | 'Formateur' | 'Enseignant'
  description: string
  actions: Array<{ label: string; detail: string; href: string }>
}

export default function PersonnelDashboard({
  fonction,
  description,
  actions,
}: PersonnelDashboardProps) {
  return (
    <main style={{ minHeight: '100dvh', background: '#F6F8FB', padding: '48px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ color: '#C9922A', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Espace Personnel</p>
        <h1 style={{ color: '#0F2347', fontSize: 34, margin: '8px 0' }}>{fonction}</h1>
        <p style={{ color: '#64748B', maxWidth: 680, lineHeight: 1.7 }}>{description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginTop: 32 }}>
          {actions.map(action => (
            <Link key={action.label} href={action.href} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 22, textDecoration: 'none' }}>
              <strong style={{ display: 'block', color: '#0F2347', marginBottom: 8 }}>{action.label}</strong>
              <span style={{ color: '#64748B', fontSize: 13, lineHeight: 1.5 }}>{action.detail}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
