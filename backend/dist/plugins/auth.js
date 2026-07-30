import jwt from '@fastify/jwt';
import { env } from '../config/env.js';
export const authPlugin = async (app) => {
    await app.register(jwt, {
        secret: env.JWT_SECRET,
        sign: { expiresIn: env.JWT_EXPIRES_IN },
    });
    app.decorate('authenticate', async (request) => {
        await request.jwtVerify();
    });
};
//# sourceMappingURL=auth.js.map