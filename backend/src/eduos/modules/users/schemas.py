from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class PersonnelInput(BaseModel):
    nom: str = Field(min_length=2, max_length=80)
    prenom: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    fonction: Literal["coordinateur", "commercial", "formateur", "enseignant"]
    telephone: str | None = Field(default=None, max_length=30)
    specialite: str | None = Field(default=None, max_length=180)
    taux_horaire: Decimal = Field(default=Decimal("0"), ge=0)
