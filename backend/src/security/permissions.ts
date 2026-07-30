import type { PersonnelFonction, UserRole } from '../types/auth.js'

export type Permission =
  | 'dashboard:view'
  | 'personnel:manage'
  | 'prospects:manage'
  | 'inscriptions:manage'
  | 'planning:manage'
  | 'presence:manage'
  | 'paiements:view'
  | 'paiements:manage'
  | 'ressources:manage'
  | 'evaluations:manage'
  | 'messages:send'

const personnelPermissions: Record<PersonnelFonction, Permission[]> = {
  coordinateur: [
    'dashboard:view',
    'planning:manage',
    'presence:manage',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
  commercial: [
    'dashboard:view',
    'prospects:manage',
    'inscriptions:manage',
    'paiements:view',
    'messages:send',
  ],
  formateur: [
    'dashboard:view',
    'presence:manage',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
  enseignant: [
    'dashboard:view',
    'presence:manage',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
}

export function hasPermission(
  role: UserRole,
  fonction: PersonnelFonction | null,
  permission: Permission,
): boolean {
  if (role === 'directeur') return true
  if (role === 'personnel' && fonction) return personnelPermissions[fonction].includes(permission)
  return permission === 'dashboard:view'
}
