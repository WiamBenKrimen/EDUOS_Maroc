from uuid import UUID

import asyncpg
from fastapi import HTTPException

from eduos.modules.common import rows
from eduos.modules.participant import repository
from eduos.modules.participant.schemas import (
    AccountInput,
    EvaluationSubmissionInput,
)


async def profile(pool: asyncpg.Pool, user: asyncpg.Record) -> dict:
    item = await repository.get_profile(
        pool,
        user["id"],
        user["centre_id"],
    )
    if not item:
        raise HTTPException(404, "Profil participant introuvable.")
    return dict(item)


async def dashboard(pool: asyncpg.Pool, user: asyncpg.Record) -> dict:
    participant_profile = await profile(pool, user)
    stats = await repository.dashboard_stats(pool, user["id"])
    sessions = await repository.list_sessions(pool, user["id"], 12)
    notifications = await repository.list_notifications(pool, user["id"], 5)
    documents = await repository.list_documents(pool, user["id"])
    reports = await list_reports(pool, user)
    return {
        "profile": participant_profile,
        "stats": dict(stats),
        "sessions": rows(sessions),
        "notifications": rows(notifications),
        "documents": rows(documents[:5]),
        "latest_report": reports[0] if reports else None,
    }


async def payments(pool: asyncpg.Pool, user: asyncpg.Record) -> dict:
    return {
        "items": rows(await repository.list_payments(pool, user["id"])),
        "methods": rows(
            await repository.list_payment_methods(pool, user["centre_id"])
        ),
    }


async def list_reports(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
) -> list[dict]:
    reports = rows(await repository.list_reports(pool, user["id"]))
    competencies = await repository.list_report_competencies(
        pool,
        user["id"],
    )
    by_report: dict[UUID, list[dict]] = {}
    for competency in competencies:
        by_report.setdefault(competency["rapport_id"], []).append(
            dict(competency)
        )
    for report in reports:
        report["competences"] = by_report.get(report["id"], [])
    return reports


async def update_account(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: AccountInput,
) -> dict:
    async with pool.acquire() as connection:
        try:
            async with connection.transaction():
                item = await repository.update_account(
                    connection,
                    user["id"],
                    user["centre_id"],
                    payload,
                )
                if not item:
                    raise HTTPException(404, "Profil participant introuvable.")
        except asyncpg.UniqueViolationError as exc:
            raise HTTPException(
                409,
                "Cette adresse e-mail est déjà utilisée.",
            ) from exc
    return await profile(pool, user)


async def evaluation_detail(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    evaluation_id: UUID,
) -> dict:
    evaluation = await repository.get_evaluation(
        pool,
        user["id"],
        evaluation_id,
    )
    if not evaluation:
        raise HTTPException(404, "Évaluation accessible introuvable.")
    options = await repository.list_evaluation_options(pool, evaluation_id)
    questions: dict[UUID, dict] = {}
    for row in options:
        question = questions.setdefault(
            row["question_id"],
            {
                "id": row["question_id"],
                "texte": row["texte"],
                "ordre": row["ordre"],
                "points": row["points"],
                "options": [],
            },
        )
        question["options"].append(
            {
                "id": row["option_id"],
                "texte": row["option_texte"],
                "ordre": row["option_ordre"],
            }
        )
    return {**dict(evaluation), "questions": list(questions.values())}


async def submit_evaluation(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    evaluation_id: UUID,
    payload: EvaluationSubmissionInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            evaluation = await repository.get_evaluation(
                connection,
                user["id"],
                evaluation_id,
            )
            if not evaluation:
                raise HTTPException(404, "Évaluation accessible introuvable.")
            if evaluation["submitted_at"] is not None:
                raise HTTPException(409, "Cette évaluation a déjà été soumise.")
            attempt_id = evaluation["attempt_id"] or await repository.create_attempt(
                connection,
                evaluation_id,
                evaluation["participant_id"],
            )
            if not attempt_id:
                raise HTTPException(409, "Une tentative existe déjà.")
            earned = 0.0
            seen_questions: set[UUID] = set()
            for answer in payload.answers:
                if answer.question_id in seen_questions:
                    raise HTTPException(422, "Une question a plusieurs réponses.")
                graded = await repository.grade_answer(
                    connection,
                    evaluation_id,
                    answer.question_id,
                    answer.option_id,
                )
                if not graded:
                    raise HTTPException(
                        422,
                        "Réponse invalide pour cette évaluation.",
                    )
                seen_questions.add(answer.question_id)
                points = float(graded["points"]) if graded["correcte"] else 0.0
                earned += points
                await repository.create_evaluation_answer(
                    connection,
                    attempt_id,
                    answer.question_id,
                    answer.option_id,
                    graded["correcte"],
                    points,
                )
            total = await repository.total_evaluation_points(
                connection,
                evaluation_id,
            )
            score = round(
                earned / total * float(evaluation["score_max"]),
                2,
            ) if total else 0.0
            attempt = await repository.finish_attempt(
                connection,
                attempt_id,
                score,
            )
    return dict(attempt)
