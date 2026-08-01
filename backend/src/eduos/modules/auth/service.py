import asyncpg
from fastapi import HTTPException, status

from eduos.core.security import create_token
from eduos.modules.auth import repository


def serialize_user(user: asyncpg.Record) -> dict:
    return {
        "id": str(user["id"]),
        "nom": f'{user["prenom"]} {user["nom"]}',
        "email": user["email"],
        "role": user["role"],
        "personnelFonction": user["personnel_fonction"],
        "centreId": str(user["centre_id"]) if user["centre_id"] else None,
    }


async def authenticate(pool: asyncpg.Pool, email: str, password: str) -> dict:
    user = await repository.find_by_credentials(pool, email.lower(), password)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Adresse e-mail ou mot de passe incorrect.",
        )
    await repository.record_login(pool, user["id"])
    return {**serialize_user(user), "token": create_token(user)}
