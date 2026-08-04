from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class EnrollmentInput(BaseModel):
    prenom: str = Field(min_length=2, max_length=80)
    nom: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    telephone: str | None = Field(default=None, max_length=30)
    date_naissance: date | None = None
    ville: str | None = Field(default=None, max_length=80)
    adresse: str | None = None
    cohorte_id: UUID
    plan: Literal["mensuel", "trimestriel", "annuel"] = "mensuel"
