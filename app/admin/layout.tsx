'use client'

import Link from 'next/link'
import LogoutButton from '../logout-button'

const NAV = [
  { href: '/utilisateurs', label: 'Utilisateurs', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/roles', label: 'Rôles & Permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { href: '/integrations', label: 'Intégrations', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { href: '/audit', label: 'Journal d\'audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <aside style={{ width: 240, background: '#1a1823', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '.95rem', color: '#fff' }}>EDUOS Admin</div>
              <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Super administrateur</div>
            </div>
            <LogoutButton />
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <Link key={item.href} href={`/admin${item.href}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: 'rgba(255,255,255,.65)', textDecoration: 'none', fontSize: '.84rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 500, transition: 'background .15s, color .15s' }}
              onMouseEnter={e => { const t = e.currentTarget as HTMLAnchorElement; t.style.background = 'rgba(255,255,255,.08)'; t.style.color = '#fff' }}
              onMouseLeave={e => { const t = e.currentTarget as HTMLAnchorElement; t.style.background = 'transparent'; t.style.color = 'rgba(255,255,255,.65)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700 }}>SU</div>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Super Admin</div>
              <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)' }}>Accès complet</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 240, background: '#F5F6F8', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
