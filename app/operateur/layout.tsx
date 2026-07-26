'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../logout-button'
import { getUser } from '../../lib/auth'

const navItems = [
  {
    label: 'Inscription',
    href: '/operateur/inscription',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    label: 'Planning',
    href: '/operateur/planning',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Présence',
    href: '/operateur/presence',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    label: 'Paiements',
    href: '/operateur/paiements',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Attestations',
    href: '/operateur/attestations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
  {
    label: 'Ressources',
    href: '/operateur/ressources',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '/operateur/documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: 'Évaluations',
    href: '/operateur/evaluations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/operateur/messages',
    badge: '3',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

export default function OperateurLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = getUser()

  useEffect(() => setMenuOpen(false), [pathname])

  const initials = user?.nom ? user.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'OP'

  return (
    <div className="dir-shell">
      {menuOpen && (
        <button className="dir-overlay" aria-label="Fermer" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`dir-sidebar${menuOpen ? ' is-open' : ''}`}>
        {/* Brand */}
        <div className="dir-brand">
          <Link href="/operateur/inscription" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/images/logo.png" alt="EDUOS MAROC" width={115} height={38} style={{ height: 38, width: 'auto', objectFit: 'contain' }} priority />
          </Link>
          <span className="dir-brand-role" style={{ marginLeft: 'auto', background: 'rgba(5,150,105,.09)', color: '#059669', padding: '3px 8px', borderRadius: 6 }}>Opérateur</span>
        </div>

        {/* Nav */}
        <nav className="dir-nav">
          <div className="dir-nav-label">Gestion Opérationnelle</div>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dir-nav-link${active ? ' active' : ''}`}
              >
                <span className="dir-nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className="badge badge-green" style={{ fontSize: '.64rem', padding: '2px 7px' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="dir-sidebar-footer">
          <div className="dir-user-avatar" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            {initials}
          </div>
          <div className="dir-user-info">
            <strong>{user?.nom ?? 'Opérateur EDUOS'}</strong>
            <span>{user?.email ?? 'Centre Atlas'}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="dir-content">
        {/* Topbar */}
        <header className="dir-topbar">
          <button className="dir-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <div className="dir-topbar-right">
            <button className="dir-topbar-icon-btn" aria-label="Notifications">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="dir-notif-dot" />
            </button>
            <div className="dir-topbar-avatar" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dir-main">
          {children}
        </main>
      </div>
    </div>
  )
}
