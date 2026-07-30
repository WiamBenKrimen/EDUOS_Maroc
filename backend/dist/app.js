import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { personnelRoutes } from './modules/personnel/personnel.routes.js';
import { authPlugin } from './plugins/auth.js';
export async function buildApp() {
    const app = Fastify({
        logger: { level: env.LOG_LEVEL },
        trustProxy: env.NODE_ENV === 'production',
    });
    await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
    await app.register(authPlugin);
    await app.register(healthRoutes, { prefix: '/api/health' });
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(personnelRoutes, { prefix: '/api/personnel' });
    app.setNotFoundHandler((_request, reply) => {
        void reply.code(404).send({ message: 'Route introuvable.' });
    });
    app.setErrorHandler((error, request, reply) => {
        request.log.error(error);
        const appError = error;
        if (appError.code === '23505') {
            void reply.code(409).send({ message: 'Cette donnée existe déjà.' });
            return;
        }
        const statusCode = appError.statusCode && appError.statusCode < 500 ? appError.statusCode : 500;
        void reply.code(statusCode).send({
            message: statusCode === 500 ? 'Erreur interne du serveur.' : appError.message,
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map