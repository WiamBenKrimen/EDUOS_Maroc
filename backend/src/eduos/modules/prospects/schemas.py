from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class ProspectInput(BaseModel):
    nom_complet: str = Field(min_length=2, max_length=160)
    email: EmailStr | None = None
    telephone: str | None = Field(default=None, max_length=30)
    formation_souhaitee: str | None = Field(default=None, max_length=160)
    source: str | None = Field(default=None, max_length=80)
    notes: str | None = None


class ProspectStatusInput(BaseModel):
    statut: Literal["nouveau", "en_cours", "inscrit", "perdu"]
