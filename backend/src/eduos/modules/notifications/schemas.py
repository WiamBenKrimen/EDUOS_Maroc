from pydantic import BaseModel


class ReminderRuleStatusInput(BaseModel):
    actif: bool
