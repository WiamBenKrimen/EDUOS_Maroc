import { z } from 'zod';
import { query } from '../../database/query.js';
import { authorize } from '../../plugins/authorize.js';
const createSchema = z.object({
    nom: z.string().trim().min(2).max(80),
    prenom: z.string().trim().min(2).max(80),
    email: z.string().email().transform(value => value.trim().toLowerCase()),
    telephone: z.string().trim().max(30).optional(),
    fonction: z.enum(['coordinateur', 'commercial', 'formateur', 'enseignant']),
    password: z.string().min(8).max(200),
});
export const personnelRoutes = async (app) => {
    const guards = [app.authenticate, authorize('personnel:manage')];
    app.get('/', { preHandler: guards }, async (request) => {
        return query(`SELECT id, nom, prenom, email, telephone, personnel_fonction, statut, created_at
         FROM users
        WHERE centre_id = $1 AND role = 'personnel'
        ORDER BY prenom, nom`, [request.user.centreId]);
    });
    app.post('/', { preHandler: guards }, async (request, reply) => {
        const parsed = createSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({
                message: 'Données du personnel invalides.',
                errors: z.flattenError(parsed.error).fieldErrors,
            });
        }
        const input = parsed.data;
        const rows = await query(`INSERT INTO users (
         centre_id, role, personnel_fonction, nom, prenom, email, telephone, password_hash
       ) VALUES ($1, 'personnel', $2, $3, $4, $5, $6, crypt($7, gen_salt('bf')))
       RETURNING id, nom, prenom, email, telephone, personnel_fonction, statut, created_at`, [
            request.user.centreId,
            input.fonction,
            input.nom,
            input.prenom,
            input.email,
            input.telephone ?? null,
            input.password,
        ]);
        return reply.code(201).send(rows[0]);
    });
};
//# sourceMappingURL=personnel.routes.js.map