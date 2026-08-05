from uuid import UUID

from pydantic import BaseModel, Field


class MessageInput(BaseModel):
    recipient_id: UUID
    body: str = Field(min_length=1, max_length=2000)
