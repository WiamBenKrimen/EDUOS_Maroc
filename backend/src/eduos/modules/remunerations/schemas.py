from typing import Literal

from pydantic import BaseModel


class RemunerationStatusInput(BaseModel):
    statut: Literal["en_attente", "calculee", "validee", "payee", "annulee"]
