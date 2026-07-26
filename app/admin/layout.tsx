'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '../logout-button'

const NAV = [
  {
    href: '/utilisateurs', label: 'Utilisateurs',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    href: '/roles', label: 'Rôles & Permissions',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    href: '/integrations', label: 'Intégrations',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    href: '/audit', label: "Journal d'audit",
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="dir-shell">
      <aside className="dir-sidebar">
        <div className="dir-brand">
          <Link href="/admin/utilisateurs" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} style={{ height: 64, width: 'auto', objectFit: 'contain', display: 'block' }} priority />
          </Link>
          <span className="dir-brand-role" style={{ marginLeft: 'auto', background: 'rgba(220,38,38,.08)', color: '#DC2626', padding: '3px 8px', borderRadius: 6 }}>Admin</span>
        </div>

        <nav className="dir-nav">
          <div className="dir-nav-label">Système</div>
          {NAV.map(item => {
            const active = pathname.startsWith(`/admin${item.href}`)
            return (
              <Link
                key={item.href}
                href={`/admin${item.href}`}
                className={`dir-nav-link${active ? ' active' : ''}`}
              >
                <span className="dir-nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon}/>
                  </svg>
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="dir-sidebar-footer">
          <div className="dir-user-avatar" style={{ background: 'linear-gradient(135deg,#DC2626,#b91c1c)' }}>SU</div>
          <div className="dir-user-info">
            <strong>Super Admin</strong>
            <span>Accès complet</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="dir-content">
        <header className="dir-topbar">
          <div />
          <div className="dir-topbar-right">
            <button className="dir-topbar-icon-btn" aria-label="Notifications">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
            <div className="dir-topbar-avatar" style={{ background: 'linear-gradient(135deg,#1B3A6B,#DC2626)' }}>SU</div>
          </div>
        </header>
        <main className="dir-main">{children}</main>
      </div>
    </div>
  )
}
