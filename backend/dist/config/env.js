import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    DATABASE_URL: z.string().min(1),
    DATABASE_SSL: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('8h'),
    CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('Configuration backend invalide:', z.treeifyError(result.error));
    process.exit(1);
}
export const env = result.data;
//# sourceMappingURL=env.js.map