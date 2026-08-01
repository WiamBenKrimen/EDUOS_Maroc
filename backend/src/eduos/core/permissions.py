from enum import Enum


class Permission(str, Enum):
    MANAGE_CENTRE = "centre:manage"
    MANAGE_USERS = "users:manage"
    MANAGE_PROSPECTS = "prospects:manage"
    MANAGE_ACADEMICS = "academics:manage"
    MANAGE_BILLING = "billing:manage"
    VIEW_REPORTS = "reports:view"


ROLE_PERMISSIONS: dict[str, frozenset[Permission]] = {
    "admin": frozenset(Permission),
    "directeur": frozenset(Permission),
    "personnel": frozenset(),
    "participant": frozenset(),
}


def has_permission(role: str, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, frozenset())
