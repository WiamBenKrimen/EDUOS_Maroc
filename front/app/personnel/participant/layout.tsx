'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../../logout-button'

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
    badge: '2',
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

  useEffect(() => setMenuOpen(false), [pathname])

  const isActive = (item: typeof navItems[0]) => pathname.startsWith(item.href)

  return (
    <div className={`part-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
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
              {'badge' in item && item.badge && <span className="part-nav-badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="part-sidebar-footer">
          <div className="part-user-card" style={{ marginBottom: 10 }}>
            <div className="part-user-info">
              <strong>Yasmine Bennani</strong>
              <span>Élève · Anglais B2</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="part-content">
        <header className="part-topbar">
          <button className="part-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div style={{ position: 'relative', width: 300 }}>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher (cours, devoirs, reçus...)"
              style={{
                width: '100%',
                padding: '8px 14px 8px 38px',
                borderRadius: 99,
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                fontSize: '.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>2</span>
              </button>

              {showNotifs && (
                <div style={{ position: 'absolute', top: 48, right: 0, width: 300, background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', zIndex: 100, padding: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: '.84rem', color: '#0F2347', marginBottom: 8, borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                    Notifications Apprenant
                  </div>
                  <div style={{ fontSize: '.78rem', color: '#475569', marginBottom: 8 }}>
                    🔔 Prochaine séance d'Anglais B2 demain à 09h00.
                  </div>
                  <div style={{ fontSize: '.78rem', color: '#475569', padding: '6px 0' }}>
                    📄 Nouveau reçu de paiement disponible au téléchargement.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="part-user-avatar" style={{ width: 36, height: 36, fontSize: '.8rem' }}>YB</div>
              <div>
                <span style={{ display: 'block', fontSize: '.84rem', fontWeight: 700, color: '#0F2347' }}>Yasmine Bennani</span>
                <span style={{ display: 'block', fontSize: '.7rem', color: '#64748B' }}>Anglais B2</span>
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
