from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class PaymentInput(BaseModel):
    facture_id: UUID
    reference: str = Field(min_length=2, max_length=60)
    montant: Decimal = Field(gt=0)
    methode: Literal["carte", "virement", "especes", "cheque", "tpe"]
    transaction_ref: str | None = None
    paid_at: datetime | None = None
