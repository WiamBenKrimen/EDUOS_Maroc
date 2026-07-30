import { z } from 'zod';
import { findUserByCredentials, findUserById, recordLogin } from './auth.repository.js';
const loginSchema = z.object({
    email: z.string().email().transform(value => value.trim().toLowerCase()),
    password: z.string().min(8).max(200),
});
function serializeUser(user) {
    return {
        id: user.id,
        nom: `${user.prenom} ${user.nom}`,
        email: user.email,
        role: user.role,
        personnelFonction: user.personnel_fonction ?? undefined,
        centreId: user.centre_id,
    };
}
export const authRoutes = async (app) => {
    app.post('/login', async (request, reply) => {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({
                message: 'Données de connexion invalides.',
                errors: z.flattenError(parsed.error).fieldErrors,
            });
        }
        const user = await findUserByCredentials(parsed.data.email, parsed.data.password);
        if (!user) {
            return reply.code(401).send({ message: 'Adresse e-mail ou mot de passe incorrect.' });
        }
        const token = app.jwt.sign({
            sub: user.id,
            role: user.role,
            personnelFonction: user.personnel_fonction,
            centreId: user.centre_id,
            email: user.email,
        });
        await recordLogin(user.id);
        return { ...serializeUser(user), token };
    });
    app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
        const user = await findUserById(request.user.sub);
        if (!user)
            return reply.code(401).send({ message: 'Utilisateur introuvable ou inactif.' });
        return serializeUser(user);
    });
};
//# sourceMappingURL=auth.routes.js.map