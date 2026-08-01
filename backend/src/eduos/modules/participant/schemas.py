from datetime import date
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ProgressInput(BaseModel):
    progression: int = Field(ge=0, le=100)


class AccountInput(BaseModel):
    prenom: str = Field(min_length=2, max_length=80)
    nom: str = Field(min_length=2, max_length=80)
    email: EmailStr
    telephone: str | None = Field(default=None, max_length=30)
    date_naissance: date | None = None
    adresse: str | None = None
    ville: str | None = Field(default=None, max_length=80)
    email_notifications: bool = True
    course_reminders: bool = True


class PasswordInput(BaseModel):
    current_password: str = Field(min_length=8, max_length=200)
    new_password: str = Field(min_length=8, max_length=200)


class EvaluationAnswerInput(BaseModel):
    question_id: UUID
    option_id: UUID


class EvaluationSubmissionInput(BaseModel):
    answers: list[EvaluationAnswerInput] = Field(min_length=1)
