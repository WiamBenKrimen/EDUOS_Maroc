'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '../logout-button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="dir-shell">
      <aside className="dir-sidebar">
        <div className="dir-brand"><Link href="/admin/demandes"><Image className="sidebar-logo" src="/images/logo.png" alt="EDUOS MAROC" width={180} height={64} priority /></Link></div>
        <nav className="dir-nav">
          <div className="dir-nav-label">Administration EDUOS</div>
          <Link href="/admin/demandes" className={`dir-nav-link${pathname.startsWith('/admin/demandes') ? ' active' : ''}`}>
            <span className="dir-nav-icon">⌁</span>Demandes centres
          </Link>
        </nav>
        <div className="dir-sidebar-footer">
          <div className="dir-footer-user-card"><div className="dir-footer-avatar">AE</div><div className="dir-user-info"><strong>Admin EDUOS</strong><span>Administration</span></div></div>
          <LogoutButton />
        </div>
      </aside>
      <div className="dir-content">
        <header className="dir-topbar"><div className="dir-topbar-right"><strong style={{ color: '#0F2347', fontSize: 13 }}>Validation des centres</strong></div></header>
        <main className="dir-main">{children}</main>
      </div>
    </div>
  )
}
