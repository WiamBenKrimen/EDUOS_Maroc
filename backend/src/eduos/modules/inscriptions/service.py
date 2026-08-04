import asyncpg
from fastapi import HTTPException

from eduos.modules.inscriptions import repository
from eduos.modules.inscriptions.schemas import EnrollmentInput


async def create(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: EnrollmentInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            cohort = await repository.lock_cohort(
                connection,
                payload.cohorte_id,
                user["centre_id"],
            )
            if not cohort:
                raise HTTPException(404, "Cohorte introuvable.")

            enrolled = await repository.count_active(
                connection, payload.cohorte_id
            )
            if enrolled >= cohort["capacite"]:
                raise HTTPException(409, "Cette cohorte est complète.")

            account = await repository.create_account(
                connection,
                user["centre_id"],
                user["id"],
                payload,
            )
            participant = await repository.create_participant(
                connection, account["id"], payload
            )
            enrollment = await repository.create_enrollment(
                connection,
                participant["id"],
                cohort,
                user["id"],
            )
            await repository.create_contract_record(
                connection,
                user["centre_id"],
                participant["id"],
                enrollment["id"],
                user["id"],
                f"{payload.prenom} {payload.nom}",
            )

    return {
        "participant_id": str(participant["id"]),
        "matricule": participant["matricule"],
        "inscription_id": str(enrollment["id"]),
        "reference": enrollment["reference"],
        "email": account["email"],
    }
