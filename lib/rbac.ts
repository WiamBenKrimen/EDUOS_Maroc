import type { Role } from './auth'

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
  | 'admin:users'
  | 'admin:roles'
  | 'admin:integrations'
  | 'admin:audit'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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
  ],
  operateur: [
    'inscription:manage',
    'planning:view',
    'presence:manage',
    'paiements:view',
    'attestations:generate',
    'ressources:view',
    'ressources:manage',
    'evaluations:manage',
    'messages:send',
  ],
  participant: [
    'participant:view',
    'ressources:view',
    'messages:send',
  ],
  admin: [
    'dashboard:view',
    'admin:users',
    'admin:roles',
    'admin:integrations',
    'admin:audit',
    'paiements:view',
    'rapports:view',
  ],
}

/** Returns true if the given role has the given permission. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
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
