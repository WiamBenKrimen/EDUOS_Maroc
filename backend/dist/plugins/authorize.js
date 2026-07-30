import { hasPermission } from '../security/permissions.js';
export function authorize(permission) {
    return async (request, reply) => {
        const { role, personnelFonction } = request.user;
        if (!hasPermission(role, personnelFonction, permission)) {
            return reply.code(403).send({ message: 'Accès interdit pour cette fonction.' });
        }
    };
}
//# sourceMappingURL=authorize.js.map