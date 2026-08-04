from datetime import date

from eduos.core.logging import get_logger

logger = get_logger(__name__)


async def generate_invoices(period: date) -> None:
    """Point d'entrée du worker de génération des factures."""
    logger.info(
        "Génération des factures demandée",
        extra={"period": str(period)},
    )
