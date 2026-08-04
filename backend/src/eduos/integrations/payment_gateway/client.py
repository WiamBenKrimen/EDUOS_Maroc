from decimal import Decimal
from typing import Protocol


class PaymentGateway(Protocol):
    async def create_payment(
        self,
        reference: str,
        amount: Decimal,
        currency: str = "MAD",
    ) -> str: ...
