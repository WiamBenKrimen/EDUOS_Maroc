'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import LogoutButton from '../logout-button'
import { getUser } from '../../lib/auth'

const NAVY = '#1B3A6B'
const GOLD = '#C9922A'

const navItems = [
  ['Inscription', '/operateur/inscription', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6'],
  ['Planning', '/operateur/planning', 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2'],
  ['Présence', '/operateur/presence', 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'],
  ['Paiements', '/operateur/paiements', 'M3 6h18v12H3z M3 10h18 M7 15h3'],
  ['Attestations', '/operateur/attestations', 'M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M9 13l-1 9 4-2 4 2-1-9'],
  ['Ressources', '/operateur/ressources', 'M3 6h7l2 3h9v11H3z'],
  ['Documents', '/operateur/documents', 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h6 M9 17h6'],
  ['Évaluations', '/operateur/evaluations', 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'],
  ['Messages', '/operateur/messages', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
] as const

const pageDescriptions: Record<string, string> = {
  Inscription: 'Créer et finaliser un nouveau dossier apprenant',
  Planning: 'Organiser les cours, les groupes et les salles',
  Présence: 'Suivre les présences et valider les sessions',
  Paiements: 'Contrôler les échéances et enregistrer les règlements',
  Attestations: 'Préparer et délivrer les documents officiels',
  Ressources: 'Centraliser les supports pédagogiques',
  Documents: 'Classer les pièces administratives',
  Évaluations: 'Créer les évaluations et suivre les résultats',
  Messages: 'Échanger avec les apprenants et les équipes',
}

function Icon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export default function OperateurLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = getUser()
  const activeItem = navItems.find(([, href]) => pathname.startsWith(href))
  const activeLabel = activeItem?.[0] ?? 'Espace opérateur'
  const activeDescription = pageDescriptions[activeLabel] ?? 'Piloter les opérations du centre'
  const initials = user?.nom.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'OP'

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <div className="operator-shell">
      {menuOpen && <button className="operator-overlay" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}

      <aside className={`operator-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <Link href="/operateur/inscription" className="operator-brand" aria-label="Accueil de l'espace opérateur">
          <div className="operator-brand-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H3z" />
              <path d="M21 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6z" />
            </svg>
          </div>
          <div><strong>EDUOS</strong><span>Centre de formation</span></div>
        </Link>

        <div className="operator-workspace">
          <span>Centre actif</span>
          <strong>Centre Atlas</strong>
          <span className="operator-workspace-status">Actif</span>
        </div>

        <nav className="operator-nav">
          <p>ESPACE OPÉRATEUR</p>
          {navItems.map(([label, href, path]) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={active ? 'active' : ''}>
                <span className="operator-nav-icon"><Icon path={path} /></span>
                <span>{label}</span>
                {label === 'Messages' && <b>3</b>}
              </Link>
            )
          })}
        </nav>

        <div className="operator-help">
          <span>?</span>
          <div><strong>Besoin d’aide ?</strong><small>Centre d’assistance</small></div>
        </div>

        <div className="operator-user">
          <div className="operator-avatar">{initials}</div>
          <div><strong>{user?.nom ?? 'Opérateur EDUOS'}</strong><span>{user?.email ?? 'operateur@eduos.ma'}</span></div>
          <LogoutButton />

        </div>
      </aside>

      <section className="operator-content">
        <header className="operator-topbar">
          <div className="operator-title">
            <button className="operator-menu-button" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
            <div><span>Espace opérateur</span><h1>{activeLabel}</h1></div>
          </div>
          <div className="operator-actions">
            <label className="operator-search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              <input placeholder="Rechercher…" />
              <kbd>Ctrl K</kbd>
            </label>
            <button className="operator-icon-button" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M14 21h-4"/></svg>
              <i />
            </button>
            <div className="operator-top-avatar" title={user?.nom ?? 'Opérateur EDUOS'}>{initials}</div>
          </div>
        </header>

        <div className="operator-masthead">
          <div>
            <span className="operator-masthead-kicker">Centre Atlas</span>
            <strong>{activeLabel}</strong>
            <p>{activeDescription}</p>
          </div>
          <div className="operator-masthead-meta">
            <span><i /> Système opérationnel</span>
            <span>Samedi 25 juillet 2026</span>
          </div>
        </div>

        <main className="operator-main">
          <div className="operator-page-surface">{children}</div>
        </main>
      </section>
    </div>
  )
}
