export type Role = 'admin' | 'directeur' | 'personnel' | 'participant'
export type PersonnelFonction = 'coordinateur' | 'commercial' | 'formateur' | 'enseignant'

export interface User {
  id: string
  nom: string
  email: string
  role: Role
  personnelFonction?: PersonnelFonction
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
  personnelFonction?: PersonnelFonction
  centreId: string
}

export const DEMO_ACCOUNTS: Account[] = [
  { id: 'demo-admin', nom: 'Admin EDUOS', email: 'admin@eduos.ma', password: 'demo1234', role: 'admin', centreId: 'eduos' },
  { id: 'demo-directeur', nom: 'Ahmed Bennani', email: 'directeur@eduos.ma', password: 'demo1234', role: 'directeur', centreId: 'centre-demo' },
  { id: 'demo-coordinateur', nom: 'Sara Alaoui', email: 'coordinateur@eduos.ma', password: 'demo1234', role: 'personnel', personnelFonction: 'coordinateur', centreId: 'centre-demo' },
  { id: 'demo-commercial', nom: 'Omar Idrissi', email: 'commercial@eduos.ma', password: 'demo1234', role: 'personnel', personnelFonction: 'commercial', centreId: 'centre-demo' },
  { id: 'demo-formateur', nom: 'Karim Alaoui', email: 'formateur@eduos.ma', password: 'demo1234', role: 'personnel', personnelFonction: 'formateur', centreId: 'centre-demo' },
  { id: 'demo-enseignant', nom: 'Nadia Alami', email: 'enseignant@eduos.ma', password: 'demo1234', role: 'personnel', personnelFonction: 'enseignant', centreId: 'centre-demo' },
  { id: 'demo-participant', nom: 'Youssef Amrani', email: 'participant@eduos.ma', password: 'demo1234', role: 'participant', centreId: 'centre-demo' },
]

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as Partial<User>
    const validRoles: Role[] = ['admin', 'directeur', 'personnel', 'participant']
    if (
      typeof user.id !== 'string' ||
      typeof user.nom !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.token !== 'string' ||
      !validRoles.includes(user.role as Role)
    ) {
      clearUser()
      return null
    }
    return user as User
  } catch {
    localStorage.removeItem(STORAGE_KEY)
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

export async function login(email: string, password: string): Promise<User> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })
    const body = await response.json().catch(() => ({})) as Partial<User> & { message?: string }
    if (!response.ok) throw new Error(body.message ?? 'Adresse e-mail ou mot de passe incorrect.')
    const user = body as User
    setUser(user)
    return user
  } catch (error) {
    if (!(error instanceof TypeError)) throw error

    const overrides = JSON.parse(localStorage.getItem(PASSWORDS_KEY) ?? '{}') as Record<string, string>
    const account = getAccounts().find(item =>
      item.email.toLowerCase() === normalizedEmail && (overrides[normalizedEmail] ?? item.password) === password,
    )
    if (!account) throw new Error('Adresse e-mail ou mot de passe incorrect.')

    const demoUser: User = {
      id: account.id,
      nom: account.nom,
      email: account.email,
      role: account.role,
      personnelFonction: account.personnelFonction,
      centreId: account.centreId,
      token: `demo-${account.id}-${Date.now()}`,
    }
    setUser(demoUser)
    return demoUser
  }
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
    centreId: 'centre-local',
  }
  const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as Account[]
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...saved, account]))
  const user: User = {
    id: account.id,
    nom: account.nom,
    email: account.email,
    role: account.role,
    personnelFonction: account.personnelFonction,
    centreId: account.centreId,
    token: `local-${account.id}-${Date.now()}`,
  }
  setUser(user)
  return user
}

export function createAccount(input: Omit<Account, 'id' | 'centreId'> & { centreId?: string }): Account {
  const email = input.email.trim().toLowerCase()
  if (getAccounts().some(item => item.email.toLowerCase() === email)) {
    throw new Error('Un compte existe déjà avec cette adresse e-mail.')
  }
  const account: Account = {
    ...input,
    email,
    id: `local-${Date.now()}`,
    centreId: input.centreId ?? getUser()?.centreId ?? 'centre-local',
  }
  const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as Account[]
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...saved, account]))
  return account
}

/** Returns the default redirect path for a given role after login. */
export function homeForRole(role: Role): string {
  switch (role) {
    case 'admin': return '/admin/demandes'
    case 'directeur': return '/directeur'
    case 'personnel': {
      const fonction = getUser()?.personnelFonction ?? 'coordinateur'
      return `/personnel/${fonction}`
    }
    case 'participant': return '/personnel/participant/mon-espace'
  }
}
