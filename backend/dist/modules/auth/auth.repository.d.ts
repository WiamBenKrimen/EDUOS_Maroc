import type { PersonnelFonction, UserRole } from '../../types/auth.js';
export interface AuthUserRow {
    id: string;
    centre_id: string;
    role: UserRole;
    personnel_fonction: PersonnelFonction | null;
    nom: string;
    prenom: string;
    email: string;
}
export declare function findUserByCredentials(email: string, password: string): Promise<AuthUserRow | null>;
export declare function findUserById(id: string): Promise<AuthUserRow | null>;
export declare function recordLogin(id: string): Promise<void>;
