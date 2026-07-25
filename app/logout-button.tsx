'use client'

import { clearUser } from '../lib/auth'

export default function LogoutButton() {
  function logout() {
    clearUser()
    window.location.assign('/')
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="logout-btn"
      title="Se déconnecter"
      aria-label="Se déconnecter"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Déconnexion
    </button>
  )
}
