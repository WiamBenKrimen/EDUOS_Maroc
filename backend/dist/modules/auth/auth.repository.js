import { query } from '../../database/query.js';
const publicColumns = 'id, centre_id, role, personnel_fonction, nom, prenom, email';
export async function findUserByCredentials(email, password) {
    const rows = await query(`SELECT ${publicColumns}
       FROM users
      WHERE email = $1::citext
        AND password_hash = crypt($2, password_hash)
        AND statut = 'actif'
      LIMIT 1`, [email, password]);
    return rows[0] ?? null;
}
export async function findUserById(id) {
    const rows = await query(`SELECT ${publicColumns}
       FROM users
      WHERE id = $1 AND statut = 'actif'
      LIMIT 1`, [id]);
    return rows[0] ?? null;
}
export async function recordLogin(id) {
    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [id]);
}
//# sourceMappingURL=auth.repository.js.map