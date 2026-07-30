import pg from 'pg';
import { env } from '../config/env.js';
export const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});
pool.on('error', error => {
    console.error('Erreur inattendue du pool PostgreSQL:', error);
});
export async function closeDatabase() {
    await pool.end();
}
//# sourceMappingURL=pool.js.map