from datetime import date
from typing import Literal

from pydantic import BaseModel


class RenewalUpdateInput(BaseModel):
    statut: Literal["a_venir", "contacte", "renouvele", "perdu"]
    date_expiration: date | None = None
    notes: str | None = None
