export type Session = {
  id: number
  day: number
  startH: number
  endH: number
  name: string
  room: string
  intervenant: string
  personnelId: string
  personnelName: string
  color: string
}

export type ChangeRequest = {
  id: number
  sessionId: number
  sessionName: string
  personnelId: string
  personnelName: string
  currentDay: number
  currentStartH: number
  currentEndH: number
  requestedDay: number
  requestedStartH: number
  requestedEndH: number
  reason: string
  status: 'En attente' | 'Approuvée' | 'Refusée'
  createdAt: string
}

export const DAYS = [
  { label: 'Lun', date: 20 },
  { label: 'Mar', date: 21 },
  { label: 'Mer', date: 22 },
  { label: 'Jeu', date: 23 },
  { label: 'Ven', date: 24 },
  { label: 'Sam', date: 25 },
  { label: 'Dim', date: 26 },
]

export const DEFAULT_SESSIONS: Session[] = [
  { id: 1, day: 0, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', intervenant: 'M. Karimi', personnelId: 'demo-coordinateur', personnelName: 'Sara Alaoui', color: '#1B3A6B' },
  { id: 2, day: 2, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', intervenant: 'M. Karimi', personnelId: 'demo-coordinateur', personnelName: 'Sara Alaoui', color: '#1B3A6B' },
  { id: 3, day: 4, startH: 9, endH: 11, name: 'Anglais B2', room: 'Salle 1', intervenant: 'M. Karimi', personnelId: 'demo-coordinateur', personnelName: 'Sara Alaoui', color: '#1B3A6B' },
  { id: 4, day: 1, startH: 10, endH: 12, name: 'Maths avancés', room: 'Salle 2', intervenant: 'Mme Alami', personnelId: 'autre-personnel', personnelName: 'Omar Idrissi', color: '#C9922A' },
  { id: 5, day: 3, startH: 14, endH: 16, name: 'Marketing digital', room: 'Salle 4', intervenant: 'M. Chraibi', personnelId: 'autre-personnel', personnelName: 'Omar Idrissi', color: '#DC2626' },
]

const SESSIONS_KEY = 'eduos_planning_sessions'
const REQUESTS_KEY = 'eduos_planning_change_requests'

export function loadSessions(): Session[] {
  if (typeof window === 'undefined') return DEFAULT_SESSIONS
  try {
    const saved = localStorage.getItem(SESSIONS_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_SESSIONS
  } catch {
    return DEFAULT_SESSIONS
  }
}

export function saveSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function loadRequests(): ChangeRequest[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveRequests(requests: ChangeRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}
