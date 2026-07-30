import { pool } from './pool.js';
export async function query(text, values = []) {
    const result = await pool.query(text, [...values]);
    return result.rows;
}
export async function transaction(work) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=query.js.map