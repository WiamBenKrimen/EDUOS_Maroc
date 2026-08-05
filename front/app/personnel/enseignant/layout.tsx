'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../../logout-button'
import { getUser } from '../../../lib/auth'

const nav: Array<{ label: string; href: string; icon: ReactNode }> = [
  { label: 'Tableau de bord', href: '/personnel/enseignant', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: 'Mes séances', href: '/personnel/enseignant/planning', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg> },
  { label: 'Séances en ligne', href: '/personnel/enseignant/seances-en-ligne', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg> },
  { label: 'Présences', href: '/personnel/enseignant/presence', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { label: 'Ressources', href: '/personnel/enseignant/ressources', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h4z"/></svg> },
  { label: 'Évaluations', href: '/personnel/enseignant/evaluations', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3h14v18H5z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg> },
  { label: 'Notes des étudiants', href: '/personnel/enseignant/notes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h3"/></svg> },
  { label: 'Messages', href: '/personnel/enseignant/messages', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
]

export default function EnseignantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const user = getUser()
  useEffect(() => setMenuOpen(false), [pathname])
  const initials = user?.nom?.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'NA'

  return (
    <div className={`op-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      {menuOpen && <button className="dir-overlay" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`op-sidebar${menuOpen ? ' is-open' : ''}`}>
        <button className="universal-sidebar-toggle" onClick={() => setCollapsed(x => !x)} aria-label="Réduire le menu">‹</button>
        <div className="op-brand"><Link href="/personnel/enseignant"><Image className="sidebar-logo" src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} priority /></Link></div>
        <nav className="op-nav"><div className="op-nav-label">ESPACE ENSEIGNANT</div>{nav.map(item => {
          const active = item.href === '/personnel/enseignant' ? pathname === item.href : pathname.startsWith(item.href)
          return <Link key={item.href} href={item.href} className={`op-nav-link${active ? ' active' : ''}`} onMouseEnter={() => router.prefetch(item.href)} onFocus={() => router.prefetch(item.href)}><span className="op-nav-icon">{item.icon}</span><span>{item.label}</span></Link>
        })}</nav>
        <div className="op-sidebar-footer"><div className="op-user-card"><div className="op-user-info"><strong>{user?.nom ?? 'Nadia Alami'}</strong><span>Enseignant</span></div></div><div style={{ marginTop: 10 }}><LogoutButton /></div></div>
      </aside>
      <div className="op-content">
        <header className="op-topbar">
          <button className="dir-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <div className="op-topbar-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input placeholder="Rechercher un cours ou un apprenant..." /></div>
          <div className="op-topbar-right"><button className="op-notif-btn" aria-label="Notifications"><span className="op-notif-badge">3</span>◌</button><div className="op-user-avatar">{initials}</div></div>
        </header>
        <main className="op-main">{children}</main>
      </div>
    </div>
  )
}
