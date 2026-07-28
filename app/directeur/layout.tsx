'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../logout-button'

const navItems = [
  {
    label: 'Dashboard',
    href: '/directeur',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Prospects',
    href: '/directeur/prospects',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Cohortes',
    href: '/directeur/cohortes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: 'Paiements',
    href: '/directeur/paiements',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Renouvellements',
    href: '/directeur/renouvellements',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    label: 'Formateurs',
    href: '/directeur/formateurs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Rapports',
    href: '/directeur/rapports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export default function DirecteurLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(4)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => setMenuOpen(false), [pathname])

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className={`dir-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`dir-sidebar${menuOpen ? ' is-open' : ''}`}>
        <button className="universal-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d={sidebarCollapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'}/></svg>
        </button>
        {/* Brand */}
        <div className="dir-brand">
          <Link href="/directeur" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image className="sidebar-logo" src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} priority />
          </Link>
        </div>

        {/* Nav */}
        <nav className="dir-nav">
          <div className="dir-nav-label">Menu Principal</div>
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dir-nav-link${active ? ' active' : ''}`}
              >
                <span className="dir-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer User */}
        <div className="dir-sidebar-footer">
          <div className="dir-footer-user-card">
            <div className="dir-footer-avatar">AB</div>
            <div className="dir-user-info">
              <strong>Ahmed Bennani</strong>
              <span>Directeur Général</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="dir-content">
        {/* Topbar */}
        <header className="dir-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F2347" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>

            {/* Universal Search Bar */}
            <div className="dir-search-wrap">
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="dir-search-input"
                placeholder="Rechercher (élèves, formateurs, cohortes...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Topbar Right */}
          <div className="dir-topbar-right">
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="dir-topbar-icon-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                aria-label="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadNotifs > 0 && <span className="dir-notif-badge">{unreadNotifs}</span>}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  width: 320,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  boxShadow: '0 10px 30px rgba(15,35,71,0.15)',
                  border: '1px solid #E2E8F0',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.84rem', color: '#0F2347' }}>Notifications Direction</span>
                    <button
                      onClick={() => setUnreadNotifs(0)}
                      style={{ fontSize: '.72rem', color: '#1B3A6B', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Tout marquer lu
                    </button>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    <div style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#0F2347' }}>Rapport financier Juin validé</div>
                      <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 2 }}>CA total encaissé : 84 200 DH (+8.4%)</div>
                    </div>
                    <div style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#0F2347' }}>5 renouvellements en attente</div>
                      <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 2 }}>Relances automatiques envoyées par SMS</div>
                    </div>
                    <div style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#0F2347' }}>Nouveau prospect qualifié</div>
                      <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 2 }}>Sami Mansouri (Demande Formation B2)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid #E2E8F0' }}>
              <div className="dir-user-avatar" style={{ width: 36, height: 36 }}>AB</div>
              <div className="dir-user-info">
                <strong>Ahmed Bennani</strong>
                <span>Directeur Général</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="dir-main">
          {children}
        </main>
      </div>
    </div>
  )
}
