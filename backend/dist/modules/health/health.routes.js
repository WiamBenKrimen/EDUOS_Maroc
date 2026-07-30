import { pool } from '../../database/pool.js';
export const healthRoutes = async (app) => {
    app.get('/', async () => ({
        status: 'ok',
        service: 'eduos-api',
        timestamp: new Date().toISOString(),
    }));
    app.get('/db', async () => {
        const result = await pool.query('SELECT now()');
        return {
            status: 'ok',
            database: 'postgresql',
            timestamp: result.rows[0]?.now,
        };
    });
};
//# sourceMappingURL=health.routes.js.map