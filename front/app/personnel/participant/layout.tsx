'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../../logout-button'
import { api } from '@/lib/api-client'
import type { ParticipantDashboard } from '@/lib/participant-types'

const navItems = [
  {
    label: 'Mon Espace',
    href: '/personnel/participant/mon-espace',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Emploi du temps',
    href: '/personnel/participant/emploi-du-temps',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3"/><line x1="8" y1="16" x2="8" y2="16" strokeWidth="3"/><line x1="16" y1="16" x2="16" y2="16" strokeWidth="3"/>
      </svg>
    ),
  },
  {
    label: 'Paiement',
    href: '/personnel/participant/paiement',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Mes Documents',
    href: '/personnel/participant/documents',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Mes Rapports',
    href: '/personnel/participant/rapports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Ressources',
    href: '/personnel/participant/ressources',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    href: '/personnel/participant/notifications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: 'Mon compte',
    href: '/personnel/participant/compte',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
]

export default function ParticipantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [dashboard, setDashboard] = useState<ParticipantDashboard | null>(null)

  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    api.get<ParticipantDashboard>('/participant/dashboard').then(setDashboard).catch(() => undefined)
  }, [pathname])

  const isActive = (item: typeof navItems[0]) => pathname.startsWith(item.href)
  const profile = dashboard?.profile
  const unread = dashboard?.stats.notifications_non_lues ?? 0
  const fullName = profile ? `${profile.prenom} ${profile.nom}` : 'Participant'
  const initials = profile ? `${profile.prenom[0] ?? ''}${profile.nom[0] ?? ''}`.toUpperCase() : 'P'
  const isDashboard = pathname === '/personnel/participant/mon-espace'

  return (
    <div className={`part-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}${pathname === '/personnel/participant/ressources' ? ' resource-route' : ''}${isDashboard ? ' dashboard-route' : ''}`}>
      {menuOpen && (
        <button className="dir-overlay" aria-label="Fermer" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`part-sidebar${menuOpen ? ' is-open' : ''}`}>
        <button className="part-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={sidebarCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}/></svg>
        </button>
        <div className="part-brand" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Link href="/personnel/participant/mon-espace" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image className="sidebar-logo" src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} priority />
            </Link>
          </div>
        </div>

        <nav className="part-nav">
          <div className="part-nav-label">Espace Apprenant</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`part-nav-link${isActive(item) ? ' active' : ''}`}
            >
              <span className="part-nav-icon">{item.icon}</span>
              {item.label}
              {item.href.endsWith('/notifications') && unread > 0 && <span className="part-nav-badge">{unread}</span>}
            </Link>
          ))}
        </nav>

        <div className="part-sidebar-footer">
          <div className="part-user-card" style={{ marginBottom: 10 }}>
            <div className="part-user-info">
              <strong>{fullName}</strong>
              <span>Élève{profile?.formation ? ` · ${profile.formation}` : ''}</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="part-content">
        {isDashboard && (
          <button className="part-dashboard-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu principal">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        )}
        <header className="part-topbar">
          <button className="part-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          <div className="part-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
            <div className="part-notification-menu" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: '#EF4444', color: '#fff', fontSize: '.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unread}</span>}
              </button>

              {showNotifs && (
                <div style={{ position: 'absolute', top: 48, right: 0, width: 300, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', zIndex: 100, padding: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: '.84rem', color: '#0F2347', marginBottom: 8, borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                    Notifications Apprenant
                  </div>
                  {dashboard?.notifications.length ? dashboard.notifications.slice(0, 3).map(notification => (
                    <div key={notification.id} style={{ fontSize: '.78rem', color: '#475569', padding: '6px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <strong style={{ display: 'block', color: '#0F2347' }}>{notification.titre}</strong>
                      {notification.message}
                    </div>
                  )) : <div style={{ fontSize: '.78rem', color: '#64748B', padding: '6px 0' }}>Aucune notification récente.</div>}
                  <Link href="/personnel/participant/notifications" onClick={() => setShowNotifs(false)} style={{ display: 'block', marginTop: 8, fontSize: '.76rem', fontWeight: 700, color: '#2563EB' }}>Voir toutes les notifications</Link>
                </div>
              )}
            </div>

            <div className="part-topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="part-user-avatar" style={{ width: 36, height: 36, fontSize: '.8rem' }}>{initials}</div>
              <div>
                <span style={{ display: 'block', fontSize: '.84rem', fontWeight: 700, color: '#0F2347' }}>{fullName}</span>
                <span style={{ display: 'block', fontSize: '.7rem', color: '#64748B' }}>{profile?.formation ?? 'Espace participant'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="part-main">
          {children}
        </main>
      </div>
    </div>
  )
}
