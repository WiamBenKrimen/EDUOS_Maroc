import jwt from '@fastify/jwt'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../config/env.js'

export const authPlugin: FastifyPluginAsync = async app => {
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  })

  app.decorate('authenticate', async request => {
    await request.jwtVerify()
  })
}
