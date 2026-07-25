'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import LogoutButton from '../logout-button'

const NAVY_DARK = '#0F2347'
const NAVY = '#1B3A6B'
const GOLD = '#C9922A'

const navItems = [
  {
    label: 'Mon espace',
    href: '/participant/mon-espace',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Paiement',
    href: '/participant/paiement',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '/participant/documents',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: 'Rapports',
    href: '/participant/rapports',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Ressources',
    href: '/participant/ressources',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
]

export default function ParticipantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  function isActive(item: typeof navItems[0]) {
    return pathname.startsWith(item.href)
  }

  const activeLabel = navItems.find(i => isActive(i))?.label ?? 'Mon espace'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F6F8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 248,
        minWidth: 248,
        background: NAVY_DARK,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '26px 20px 22px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: 'rgba(201,146,42,.18)',
              border: '1px solid rgba(201,146,42,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 19, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1 }}>EDUOS</div>
              <div style={{ fontSize: 10.5, color: GOLD, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 3 }}>Mon espace</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 12px 10px' }}>Navigation</div>
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 12px',
                  borderRadius: 9,
                  marginBottom: 2,
                  cursor: 'pointer',
                  background: active ? 'rgba(255,255,255,.09)' : 'transparent',
                  borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,.52)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 13.5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all .15s',
                }}>
                  <span style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `linear-gradient(135deg, ${GOLD} 0%, #e8a83a 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13, color: '#fff',
              flexShrink: 0,
            }}>YB</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Yasmine Bennani</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Élève · Anglais B2</div>
            </div>
            <LogoutButton />
          </div>
          {/* Parent view link */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <Link href="/participant/mon-espace" style={{ fontSize: 11.5, color: 'rgba(255,255,255,.35)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Vue Parent disponible
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 248, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          height: 64,
          background: '#fff',
          borderBottom: '1px solid rgba(27,58,107,.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: 'rgba(27,58,107,.38)', fontWeight: 500 }}>EDUOS</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(27,58,107,.28)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span style={{ fontSize: 11.5, color: 'rgba(27,58,107,.38)', fontWeight: 500 }}>Mon espace</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(27,58,107,.28)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span style={{ fontSize: 13, color: NAVY, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ position: 'relative', background: '#F5F6F8', border: 'none', cursor: 'pointer', width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(27,58,107,.1)' }} />
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD} 0%, #e8a83a 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 12, color: '#fff', cursor: 'pointer' }}>YB</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
