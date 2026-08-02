from pydantic import BaseModel, Field


class ReminderRuleStatusInput(BaseModel):
    actif: bool


class WhatsAppMessageInput(BaseModel):
    recipient_id: str
    message: str = Field(min_length=1, max_length=4096)
