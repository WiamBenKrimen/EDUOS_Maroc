from typing import Protocol


class WhatsAppClient(Protocol):
    async def send(self, telephone: str, message: str) -> None: ...
