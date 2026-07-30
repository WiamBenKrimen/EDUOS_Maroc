const personnelPermissions = {
    coordinateur: [
        'dashboard:view',
        'planning:manage',
        'presence:manage',
        'ressources:manage',
        'evaluations:manage',
        'messages:send',
    ],
    commercial: [
        'dashboard:view',
        'prospects:manage',
        'inscriptions:manage',
        'paiements:view',
        'messages:send',
    ],
    formateur: [
        'dashboard:view',
        'presence:manage',
        'ressources:manage',
        'evaluations:manage',
        'messages:send',
    ],
    enseignant: [
        'dashboard:view',
        'presence:manage',
        'ressources:manage',
        'evaluations:manage',
        'messages:send',
    ],
};
export function hasPermission(role, fonction, permission) {
    if (role === 'directeur')
        return true;
    if (role === 'personnel' && fonction)
        return personnelPermissions[fonction].includes(permission);
    return permission === 'dashboard:view';
}
//# sourceMappingURL=permissions.js.map