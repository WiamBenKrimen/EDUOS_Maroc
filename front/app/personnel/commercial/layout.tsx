'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../../logout-button'
import { getUser } from '../../../lib/auth'

const nav: Array<{ label: string; href: string; icon: ReactNode }> = [
  { label: 'Tableau de bord', href: '/personnel/commercial', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: 'Prospects', href: '/personnel/commercial/prospects', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a6 6 0 0 1 12 0v2M19 8v6M22 11h-6"/></svg> },
  { label: 'Inscriptions', href: '/personnel/commercial/inscriptions', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 13h7M9 17h7"/></svg> },
  { label: 'Paiements', href: '/personnel/commercial/paiements', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
]

export default function CommercialLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const user = getUser()
  useEffect(() => setMenuOpen(false), [pathname])
  const initials = user?.nom?.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'OI'

  return (
    <div className={`op-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      {menuOpen && <button className="dir-overlay" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`op-sidebar${menuOpen ? ' is-open' : ''}`}>
        <button className="universal-sidebar-toggle" onClick={() => setCollapsed(x => !x)} aria-label="Réduire le menu">‹</button>
        <div className="op-brand"><Link href="/personnel/commercial"><Image className="sidebar-logo" src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} priority /></Link></div>
        <nav className="op-nav">
          <div className="op-nav-label">ESPACE COMMERCIAL</div>
          {nav.map(item => {
            const active = item.href === '/personnel/commercial' ? pathname === item.href : pathname.startsWith(item.href)
            return <Link key={item.href} href={item.href} className={`op-nav-link${active ? ' active' : ''}`}><span className="op-nav-icon">{item.icon}</span><span>{item.label}</span></Link>
          })}
        </nav>
        <div className="op-sidebar-footer">
          <div className="op-user-card"><div className="op-user-info"><strong>{user?.nom ?? 'Omar Idrissi'}</strong><span>Commercial du centre</span></div></div>
          <div style={{ marginTop: 10 }}><LogoutButton /></div>
        </div>
      </aside>
      <div className="op-content">
        <header className="op-topbar">
          <button className="dir-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <div className="op-topbar-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input placeholder="Rechercher un prospect ou un participant..." /></div>
          <div className="op-topbar-right"><button className="op-notif-btn" aria-label="Notifications"><span className="op-notif-badge">2</span>◌</button><div className="op-user-avatar">{initials}</div></div>
        </header>
        <main className="op-main">{children}</main>
      </div>
    </div>
  )
}
