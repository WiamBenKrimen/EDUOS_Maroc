from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class CohorteInput(BaseModel):
    formation_id: UUID
    intervenant_id: UUID | None = None
    code: str = Field(min_length=2, max_length=50)
    nom: str = Field(min_length=2, max_length=160)
    date_debut: date
    date_fin: date
    capacite: int = Field(gt=0)
    salle: str | None = None
    jours_semaine: list[int] = Field(default_factory=list)
    heure_debut: str | None = None
    heure_fin: str | None = None

    @model_validator(mode="after")
    def validate_period(self):
        if self.date_fin < self.date_debut:
            raise ValueError("La date de fin doit suivre la date de début.")
        if any(day < 1 or day > 7 for day in self.jours_semaine):
            raise ValueError(
                "Les jours de semaine doivent être compris entre 1 et 7."
            )
        return self


class CohorteUpdate(BaseModel):
    nom: str = Field(min_length=2, max_length=160)
    capacite: int = Field(gt=0)
    intervenant_id: UUID | None = None
