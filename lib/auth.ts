export type Role = 'directeur' | 'operateur' | 'participant' | 'admin'

export interface User {
  id: string
  nom: string
  email: string
  role: Role
  centreId: string
  token: string
}

const STORAGE_KEY = 'eduos_user'
const ACCOUNTS_KEY = 'eduos_accounts'
const PASSWORDS_KEY = 'eduos_password_overrides'

export interface Account {
  id: string
  nom: string
  email: string
  password: string
  role: Role
  centreId: string
}

export const DEMO_ACCOUNTS: Account[] = [
  { id: 'demo-directeur', nom: 'Ahmed Bennani', email: 'directeur@eduos.ma', password: 'demo1234', role: 'directeur', centreId: 'centre-demo' },
  { id: 'demo-operateur', nom: 'Sara Alaoui', email: 'operateur@eduos.ma', password: 'demo1234', role: 'operateur', centreId: 'centre-demo' },
  { id: 'demo-participant', nom: 'Youssef Amrani', email: 'participant@eduos.ma', password: 'demo1234', role: 'participant', centreId: 'centre-demo' },
  { id: 'demo-admin', nom: 'Super Admin', email: 'admin@eduos.ma', password: 'demo1234', role: 'admin', centreId: 'global' },
]

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem('eduos_token', user.token)
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('eduos_token')
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

export function getRole(): Role | null {
  return getUser()?.role ?? null
}

function getAccounts(): Account[] {
  if (typeof window === 'undefined') return DEMO_ACCOUNTS
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as Account[]
    return [...DEMO_ACCOUNTS, ...saved]
  } catch {
    return DEMO_ACCOUNTS
  }
}

export function login(email: string, password: string): User {
  const normalizedEmail = email.trim().toLowerCase()
  const overrides = typeof window === 'undefined' ? {} : JSON.parse(localStorage.getItem(PASSWORDS_KEY) ?? '{}') as Record<string, string>
  const account = getAccounts().find(item => item.email.toLowerCase() === normalizedEmail && (overrides[normalizedEmail] ?? item.password) === password)
  if (!account) throw new Error('Adresse e-mail ou mot de passe incorrect.')

  const user: User = {
    id: account.id,
    nom: account.nom,
    email: account.email,
    role: account.role,
    centreId: account.centreId,
    token: `demo-${account.id}-${Date.now()}`,
  }
  setUser(user)
  return user
}

export function changePassword(currentPassword: string, newPassword: string): void {
  const user = getUser()
  if (!user) throw new Error('Session introuvable.')
  const email = user.email.toLowerCase()
  const overrides = JSON.parse(localStorage.getItem(PASSWORDS_KEY) ?? '{}') as Record<string, string>
  const account = getAccounts().find(item => item.email.toLowerCase() === email)
  if (!account || (overrides[email] ?? account.password) !== currentPassword) {
    throw new Error('Le mot de passe actuel est incorrect.')
  }
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify({ ...overrides, [email]: newPassword }))
}

export function register(input: Omit<Account, 'id' | 'centreId'>): User {
  const email = input.email.trim().toLowerCase()
  if (getAccounts().some(item => item.email.toLowerCase() === email)) {
    throw new Error('Un compte existe déjà avec cette adresse e-mail.')
  }

  const account: Account = {
    ...input,
    email,
    id: `local-${Date.now()}`,
    centreId: input.role === 'admin' ? 'global' : 'centre-local',
  }
  const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as Account[]
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...saved, account]))
  return login(account.email, account.password)
}

/** Returns the default redirect path for a given role after login. */
export function homeForRole(role: Role): string {
  switch (role) {
    case 'directeur': return '/directeur'
    case 'operateur': return '/operateur/inscription'
    case 'participant': return '/participant/mon-espace'
    case 'admin': return '/admin/utilisateurs'
  }
}
