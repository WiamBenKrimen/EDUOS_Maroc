import { query } from '../../database/query.js'
import type { PersonnelFonction, UserRole } from '../../types/auth.js'

export interface AuthUserRow {
  id: string
  centre_id: string
  role: UserRole
  personnel_fonction: PersonnelFonction | null
  nom: string
  prenom: string
  email: string
}

const publicColumns = 'id, centre_id, role, personnel_fonction, nom, prenom, email'

export async function findUserByCredentials(email: string, password: string) {
  const rows = await query<AuthUserRow>(
    `SELECT ${publicColumns}
       FROM users
      WHERE email = $1::citext
        AND password_hash = crypt($2, password_hash)
        AND statut = 'actif'
      LIMIT 1`,
    [email, password],
  )
  return rows[0] ?? null
}

export async function findUserById(id: string) {
  const rows = await query<AuthUserRow>(
    `SELECT ${publicColumns}
       FROM users
      WHERE id = $1 AND statut = 'actif'
      LIMIT 1`,
    [id],
  )
  return rows[0] ?? null
}

export async function recordLogin(id: string): Promise<void> {
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [id])
}
