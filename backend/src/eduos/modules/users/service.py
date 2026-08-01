import asyncpg

from eduos.modules.users import repository
from eduos.modules.users.schemas import PersonnelInput


async def create(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: PersonnelInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            account = await repository.create_account(
                connection,
                user["centre_id"],
                user["id"],
                payload,
            )
            if payload.fonction in ("formateur", "enseignant"):
                await repository.create_intervenant(
                    connection,
                    account["id"],
                    user["centre_id"],
                    payload,
                )
    return {
        **dict(account),
        "specialite": payload.specialite,
        "taux_horaire": payload.taux_horaire,
        "groupes_actifs": 0,
    }
