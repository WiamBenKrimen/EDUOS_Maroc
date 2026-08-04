from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class SeanceInput(BaseModel):
    cohorte_id: UUID
    intervenant_id: UUID | None = None
    personnel_id: UUID | None = None
    titre: str = Field(min_length=2, max_length=180)
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    salle: str | None = None

    @model_validator(mode="after")
    def validate_period(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("La fin de séance doit suivre son début.")
        return self


class ChangeRequestDecisionInput(BaseModel):
    statut: Literal["approuvee", "refusee"]
