import type { PersonnelFonction, UserRole } from '../types/auth.js';
export type Permission = 'dashboard:view' | 'personnel:manage' | 'prospects:manage' | 'inscriptions:manage' | 'planning:manage' | 'presence:manage' | 'paiements:view' | 'paiements:manage' | 'ressources:manage' | 'evaluations:manage' | 'messages:send';
export declare function hasPermission(role: UserRole, fonction: PersonnelFonction | null, permission: Permission): boolean;
