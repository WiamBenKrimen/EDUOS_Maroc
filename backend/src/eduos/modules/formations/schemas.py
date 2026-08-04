from decimal import Decimal

from pydantic import BaseModel, Field


class FormationInput(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    titre: str = Field(min_length=2, max_length=180)
    categorie: str | None = None
    niveau: str | None = None
    duree_heures: int = Field(ge=0, default=0)
    prix_mensuel: Decimal = Field(ge=0)
    frais_inscription: Decimal = Field(
        ge=0,
        default=Decimal("0"),
    )
