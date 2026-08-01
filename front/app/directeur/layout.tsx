'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../logout-button'
import { api } from '../../lib/api-client'
import { getUser } from '../../lib/auth'
import type { User } from '../../lib/auth'

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
    label: 'Inscription',
    href: '/directeur/inscription',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
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
    label: 'Personnel',
    href: '/directeur/formateurs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Planning',
    href: '/directeur/planning',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Attestations',
    href: '/directeur/attestations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; titre: string; message: string; read_at: string | null }>>([])
  const [user, setCurrentUser] = useState<User | null>(null)
  const unreadNotifs = notifications.filter(item => !item.read_at).length

  useEffect(() => {
    setCurrentUser(getUser())
    api.get<Array<{ id: string; titre: string; message: string; read_at: string | null }>>('/director/notifications')
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [])

  async function markAllRead() {
    await api.patch('/director/notifications/read-all', {})
    setNotifications(current => current.map(item => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })))
  }

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className={`dir-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="dir-sidebar">
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
            <div className="dir-footer-avatar">{user?.nom?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'DR'}</div>
            <div className="dir-user-info">
              <strong>{user?.nom || 'Direction'}</strong>
              <span>Directeur</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="dir-content">
        {/* Topbar */}
        <header className="dir-topbar">
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
                      onClick={() => void markAllRead()}
                      style={{ fontSize: '.72rem', color: '#1B3A6B', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Tout marquer lu
                    </button>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {!notifications.length && <div style={{ padding: '18px', color: '#64748B', fontSize: '.78rem' }}>Aucune notification.</div>}
                    {notifications.map(notification => <div key={notification.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9', background: notification.read_at ? '#FFF' : '#F8FAFC' }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#0F2347' }}>{notification.titre}</div>
                      <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 2 }}>{notification.message}</div>
                    </div>)}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid #E2E8F0' }}>
              <div className="dir-user-avatar" style={{ width: 36, height: 36 }}>{user?.nom?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'DR'}</div>
              <div className="dir-user-info">
                <strong>{user?.nom || 'Direction'}</strong>
                <span>Directeur</span>
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
