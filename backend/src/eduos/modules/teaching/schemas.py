from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class ChangeRequestInput(BaseModel):
    starts_at: datetime
    ends_at: datetime
    motif: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_period(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("La fin souhaitÃ©e doit suivre le dÃ©but.")
        return self


class AttendanceEntryInput(BaseModel):
    participant_id: UUID
    statut: Literal["present", "absent", "retard", "excuse"]
    justification: str | None = Field(default=None, max_length=1000)


class AttendanceSheetInput(BaseModel):
    entries: list[AttendanceEntryInput] = Field(min_length=1)


class OnlineSessionStartInput(BaseModel):
    meeting_url: str = Field(min_length=8, max_length=2000)

    @model_validator(mode="after")
    def validate_meeting_url(self):
        if not self.meeting_url.startswith(("https://", "http://")):
            raise ValueError("Le lien de visioconférence doit commencer par http:// ou https://.")
        return self


ResourceType = Literal["dossier", "pdf", "video", "document", "exercice", "qcm"]


class ResourceInput(BaseModel):
    cohorte_id: UUID
    type: ResourceType
    titre: str = Field(min_length=2, max_length=200)
    description: str | None = None
    storage_key: str | None = None
    mime_type: str | None = Field(default=None, max_length=120)
    taille_octets: int | None = Field(default=None, ge=0)
    duree_minutes: int | None = Field(default=None, ge=0)
    semaine: int | None = Field(default=None, gt=0)
    publie: bool = True


class QuestionOptionInput(BaseModel):
    texte: str = Field(min_length=1)
    correcte: bool = False


class EvaluationQuestionInput(BaseModel):
    texte: str = Field(min_length=2)
    points: Decimal = Field(default=Decimal("1"), gt=0)
    options: list[QuestionOptionInput] = Field(min_length=2)

    @model_validator(mode="after")
    def validate_correct_option(self):
        if not any(option.correcte for option in self.options):
            raise ValueError("Chaque question doit avoir une rÃ©ponse correcte.")
        return self


class EvaluationInput(BaseModel):
    cohorte_id: UUID
    titre: str = Field(min_length=2, max_length=200)
    description: str | None = None
    duree_minutes: int = Field(gt=0, le=480)
    score_max: Decimal = Field(default=Decimal("100"), gt=0)
    publiee: bool = True
    opens_at: datetime | None = None
    closes_at: datetime | None = None
    questions: list[EvaluationQuestionInput] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_availability(self):
        if self.opens_at and self.closes_at and self.closes_at <= self.opens_at:
            raise ValueError("La fermeture doit suivre l'ouverture.")
        return self


class TicketInput(BaseModel):
    recipient_id: UUID
    sujet: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


class TicketMessageInput(BaseModel):
    message: str = Field(min_length=1, max_length=5000)


class TicketStatusInput(BaseModel):
    statut: Literal["ouvert", "en_cours", "resolu", "ferme"]


class GradeEntryInput(BaseModel):
    inscription_id: UUID
    controle: Decimal | None = Field(default=None, ge=0, le=20)
    examen: Decimal | None = Field(default=None, ge=0, le=20)
    appreciation: str | None = Field(default=None, max_length=2000)


class GradeSheetInput(BaseModel):
    entries: list[GradeEntryInput] = Field(min_length=1)
