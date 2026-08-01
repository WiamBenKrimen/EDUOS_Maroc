from uuid import UUID

from eduos.core.logging import get_logger

logger = get_logger(__name__)


async def generate_contract(enrollment_id: UUID) -> None:
    """Point d'entrée du worker de génération de contrat."""
    logger.info(
        "Génération de contrat demandée",
        extra={"enrollment_id": str(enrollment_id)},
    )
