import type { PersonnelFonction, Role } from './auth'

export type Permission =
  | 'dashboard:view'
  | 'prospects:manage'
  | 'cohortes:manage'
  | 'paiements:view'
  | 'paiements:manage'
  | 'formateurs:manage'
  | 'rapports:view'
  | 'inscription:manage'
  | 'planning:view'
  | 'presence:manage'
  | 'attestations:generate'
  | 'ressources:view'
  | 'ressources:manage'
  | 'evaluations:manage'
  | 'messages:send'
  | 'participant:view'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [],
  directeur: [
    'dashboard:view',
    'prospects:manage',
    'cohortes:manage',
    'paiements:view',
    'paiements:manage',
    'formateurs:manage',
    'rapports:view',
    'inscription:manage',
    'planning:view',
    'presence:manage',
    'attestations:generate',
    'ressources:view',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
    'participant:view',
  ],
  personnel: [],
  participant: [
    'participant:view',
    'ressources:view',
    'messages:send',
  ],
}

export const PERSONNEL_PERMISSIONS: Record<PersonnelFonction, Permission[]> = {
  coordinateur: [
    'dashboard:view',
    'cohortes:manage',
    'planning:view',
    'presence:manage',
    'ressources:view',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
  commercial: [
    'dashboard:view',
    'prospects:manage',
    'inscription:manage',
    'paiements:view',
    'messages:send',
  ],
  formateur: [
    'dashboard:view',
    'planning:view',
    'presence:manage',
    'ressources:view',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
  enseignant: [
    'dashboard:view',
    'planning:view',
    'presence:manage',
    'ressources:view',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
}

/** Returns true if the given role has the given permission. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canPersonnel(fonction: PersonnelFonction, permission: Permission): boolean {
  return PERSONNEL_PERMISSIONS[fonction].includes(permission)
}

export function canAccess(
  role: Role,
  permission: Permission,
  personnelFonction?: PersonnelFonction,
): boolean {
  if (role === 'directeur') return can(role, permission)
  if (role === 'personnel' && personnelFonction) return canPersonnel(personnelFonction, permission)
  return can(role, permission)
}

/**
 * Throws an error if the role does not have all required permissions.
 * Use in server components or API route handlers.
 */
export function requireRole(role: Role | null | undefined, ...permissions: Permission[]): void {
  if (!role) throw new Error('Unauthorized: not authenticated')
  for (const perm of permissions) {
    if (!can(role, perm)) {
      throw new Error(`Forbidden: missing permission "${perm}"`)
    }
  }
}
