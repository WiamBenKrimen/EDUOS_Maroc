'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../../logout-button'
import { getUser } from '../../../lib/auth'
import { canAccess, type Permission } from '../../../lib/rbac'

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), {
  ssr: false,
  loading: () => null,
})

const SidebarChatLink = dynamic(() => import('@/components/chat/SidebarChatLink'), {
  ssr: false,
  loading: () => null,
})

const navItems: Array<{
  label: string
  href: string
  permission?: Permission
  badge?: string
  icon: ReactNode
}> = [
  {
    label: 'Dashboard',
    href: '/personnel/coordinateur',
    permission: 'dashboard:view',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Planning',
    href: '/personnel/coordinateur/planning',
    permission: 'planning:view',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Inscription',
    href: '/personnel/coordinateur/inscription',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>
      </svg>
    ),
  },
  {
    label: 'Enseignants & Formateurs',
    href: '/personnel/coordinateur/intervenants',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Paiements',
    href: '/personnel/coordinateur/paiements',
    permission: 'paiements:view',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '/personnel/coordinateur/documents',
    permission: 'attestations:generate',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: 'Mon profil',
    href: '/personnel/coordinateur/profil',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
      </svg>
    ),
  },
]

export default function PersonnelLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const user = getUser()
  const visibleNavItems = navItems.filter(item =>
    !item.permission || (user ? canAccess(user.role, item.permission, user.personnelFonction) : false),
  )

  useEffect(() => setMenuOpen(false), [pathname])

  const initials = user?.nom ? user.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SA'

  return (
    <div className={`op-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {menuOpen && (
        <button className="dir-overlay" aria-label="Fermer" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`op-sidebar${menuOpen ? ' is-open' : ''}`}>
        <button className="universal-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d={sidebarCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}/></svg>
        </button>
        {/* Brand */}
        <div className="op-brand">
          <Link href="/personnel/coordinateur" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image className="sidebar-logo" src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} priority />
          </Link>
        </div>

        {/* Nav */}
        <nav className="op-nav">
          <div className="op-nav-label">GESTION OPÉRATIONNELLE</div>
          {visibleNavItems.map((item) => {
            const active = item.href === '/personnel/coordinateur' ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`op-nav-link${active ? ' active' : ''}`}
              >
                <span className="op-nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className="op-nav-badge">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
          <SidebarChatLink variant="op" collapsed={sidebarCollapsed} />
        </nav>

        {/* Footer */}
        <div className="op-sidebar-footer">
          <div className="op-user-card">
            <div className="op-user-info">
              <strong>{user?.nom ?? 'Sarah A.'}</strong>
              <span>{user?.email ?? 'coordinateur@eduos.ma'}</span>
            </div>
            <button className="op-dots-btn" aria-label="Options">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="op-content">
        {/* Topbar */}
        <header className="op-topbar">
          <button className="dir-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>

          {/* Centered Search */}
          <div className="op-topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher (élèves, groupes, salles...)" />
          </div>

          <div className="op-topbar-right">
            <button className="op-notif-btn" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="op-notif-badge">3</span>
            </button>

            <Link href="/personnel/coordinateur/profil" className="op-profile-widget" style={{ textDecoration: 'none' }}>
              <div className="op-user-avatar">{initials}</div>
              <div className="op-profile-info">
                <span className="op-profile-name">{user?.nom ?? 'Sarah A.'}</span>
                <span className="op-profile-role">
                  {user?.personnelFonction
                    ? user.personnelFonction.charAt(0).toUpperCase() + user.personnelFonction.slice(1)
                    : 'Personnel'}
                </span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="op-main">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
