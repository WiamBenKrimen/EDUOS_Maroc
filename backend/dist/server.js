import { buildApp } from './app.js';
import { env } from './config/env.js';
import { closeDatabase } from './database/pool.js';
const app = await buildApp();
async function shutdown(signal) {
    app.log.info({ signal }, 'Arrêt du serveur');
    await app.close();
    await closeDatabase();
    process.exit(0);
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
try {
    await app.listen({ host: env.HOST, port: env.PORT });
}
catch (error) {
    app.log.error(error);
    await closeDatabase();
    process.exit(1);
}
//# sourceMappingURL=server.js.map