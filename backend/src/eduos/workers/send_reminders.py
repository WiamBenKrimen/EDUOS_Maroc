from datetime import date

from eduos.core.logging import get_logger

logger = get_logger(__name__)


async def send_reminders(for_date: date | None = None) -> None:
    """Point d'entrée du worker de relances planifiées."""
    logger.info(
        "Traitement des relances demandé",
        extra={"for_date": str(for_date or date.today())},
    )
