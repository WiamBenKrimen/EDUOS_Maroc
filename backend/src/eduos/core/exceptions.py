class EduosError(Exception):
    """Erreur métier de base."""


class ResourceNotFoundError(EduosError):
    """Ressource métier introuvable."""


class ConflictError(EduosError):
    """Conflit avec l'état courant des données."""
