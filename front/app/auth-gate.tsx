'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getUser, homeForRole, type Role } from '../lib/auth'

const ROLE_PREFIXES: Record<Role, string> = {
  admin: '/admin',
  participant: '/personnel/participant',
  directeur: '/directeur',
  personnel: '/personnel',
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const requiredRole = (Object.entries(ROLE_PREFIXES).find(([, prefix]) => pathname.startsWith(prefix))?.[0] ?? null) as Role | null

  useEffect(() => {
    const user = getUser()

    if (requiredRole && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(homeForRole(user!.role))
      return
    }
    if ((pathname === '/login' || pathname === '/register') && user) {
      router.replace(homeForRole(user.role))
      return
    }
    setReady(true)
  }, [pathname, requiredRole, router])

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F8F5EF', color: '#1B3A6B', fontFamily: 'Inter, sans-serif' }}>
        Vérification de votre session…
      </div>
    )
  }

  return children
}
