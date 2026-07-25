'use client'

import { clearUser } from '../lib/auth'

export default function LogoutButton({ color = '#fff' }: { color?: string }) {
  function logout() {
    clearUser()
    window.location.assign('/')
  }

  return (
    <button
      type="button"
      onClick={logout}
      title="Se déconnecter et revenir à l’accueil"
      aria-label="Se déconnecter et revenir à l’accueil"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, opacity: 0.65, color, flexShrink: 0 }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  )
}
