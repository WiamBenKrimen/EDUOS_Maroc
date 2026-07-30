import type { preHandlerHookHandler } from 'fastify'
import { hasPermission, type Permission } from '../security/permissions.js'

export function authorize(permission: Permission): preHandlerHookHandler {
  return async (request, reply) => {
    const { role, personnelFonction } = request.user
    if (!hasPermission(role, personnelFonction, permission)) {
      return reply.code(403).send({ message: 'Accès interdit pour cette fonction.' })
    }
  }
}
