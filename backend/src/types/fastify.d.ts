import '@fastify/jwt'
import type { AuthTokenPayload } from './auth.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthTokenPayload
    user: AuthTokenPayload
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: import('fastify').preHandlerHookHandler
  }
}
