from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class AssistantHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=6000)


class AssistantChatInput(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[AssistantHistoryItem] = Field(default_factory=list, max_length=20)
    page_path: str = Field(default="/directeur", max_length=200)
    page_title: str | None = Field(default=None, max_length=120)


class PendingActionOutput(BaseModel):
    id: UUID
    action: str
    title: str
    description: str
    details: list[dict[str, str]]
    expires_at: str


class AssistantChatOutput(BaseModel):
    reply: str
    pending_action: PendingActionOutput | None = None


class AssistantStatusOutput(BaseModel):
    configured: bool
    provider: str = "NVIDIA NIM"
    model: str
    capabilities: list[str] = Field(default_factory=list)


class AssistantActionResult(BaseModel):
    action: str
    message: str
    result: dict[str, Any] = Field(default_factory=dict)
