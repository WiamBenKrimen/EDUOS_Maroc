from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class CentreApplicationInput(BaseModel):
    centre_nom: str = Field(min_length=2, max_length=150)
    responsable_nom: str = Field(min_length=2, max_length=160)
    telephone: str = Field(min_length=6, max_length=30)
    email: EmailStr | None = None
    ville: str = Field(min_length=2, max_length=80)
    taille_apprenants: str | None = Field(default=None, max_length=60)
    besoins: list[str] = Field(default_factory=list)
    remarques: str | None = None


class CentreApplicationDecision(BaseModel):
    statut: Literal["acceptee", "refusee"]
    motif_refus: str | None = Field(default=None, max_length=500)
    password: str = Field(default="Bienvenue2026!", min_length=8, max_length=200)
