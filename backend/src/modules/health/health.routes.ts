import type { FastifyPluginAsync } from 'fastify'
import { pool } from '../../database/pool.js'

export const healthRoutes: FastifyPluginAsync = async app => {
  app.get('/', async () => ({
    status: 'ok',
    service: 'eduos-api',
    timestamp: new Date().toISOString(),
  }))

  app.get('/db', async () => {
    const result = await pool.query<{ now: Date }>('SELECT now()')
    return {
      status: 'ok',
      database: 'postgresql',
      timestamp: result.rows[0]?.now,
    }
  })
}
