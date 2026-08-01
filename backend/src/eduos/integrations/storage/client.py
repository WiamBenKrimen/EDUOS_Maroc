from typing import Protocol


class StorageClient(Protocol):
    async def put(
        self,
        key: str,
        content: bytes,
        content_type: str,
    ) -> str: ...

    async def delete(self, key: str) -> None: ...
