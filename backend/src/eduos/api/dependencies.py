from typing import Annotated

import asyncpg
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from eduos.core.security import decode_subject
from eduos.modules.auth import repository as auth_repository

bearer = HTTPBearer(auto_error=False)


async def get_pool(request: Request) -> asyncpg.Pool:
    return request.app.state.pool


DatabasePool = Annotated[asyncpg.Pool, Depends(get_pool)]


async def current_user(
    pool: DatabasePool,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer),
    ],
) -> asyncpg.Record:
    if credentials is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Authentification requise.",
        )

    user_id = decode_subject(credentials.credentials)
    user = await auth_repository.find_active_by_id(pool, user_id)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Utilisateur introuvable ou inactif.",
        )
    return user


CurrentUser = Annotated[asyncpg.Record, Depends(current_user)]


async def directeur_required(user: CurrentUser) -> asyncpg.Record:
    if user["role"] != "directeur" or user["centre_id"] is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Accès réservé au directeur d'un centre.",
        )
    return user


Director = Annotated[asyncpg.Record, Depends(directeur_required)]


async def admin_required(user: CurrentUser) -> asyncpg.Record:
    if user["role"] != "admin":
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Accès réservé à l'administration EDUOS.",
        )
    return user


Admin = Annotated[asyncpg.Record, Depends(admin_required)]


async def teaching_staff_required(user: CurrentUser) -> asyncpg.Record:
    if (
        user["role"] != "personnel"
        or user["personnel_fonction"] not in {"formateur", "enseignant"}
        or user["centre_id"] is None
    ):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Accès réservé aux formateurs et enseignants.",
        )
    return user


TeachingStaff = Annotated[
    asyncpg.Record,
    Depends(teaching_staff_required),
]


async def teacher_required(user: CurrentUser) -> asyncpg.Record:
    if (
        user["role"] != "personnel"
        or user["personnel_fonction"] != "enseignant"
        or user["centre_id"] is None
    ):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Accès réservé aux enseignants.",
        )
    return user


Teacher = Annotated[asyncpg.Record, Depends(teacher_required)]


async def participant_required(user: CurrentUser) -> asyncpg.Record:
    if user["role"] != "participant" or user["centre_id"] is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Accès réservé aux participants.",
        )
    return user


Participant = Annotated[asyncpg.Record, Depends(participant_required)]
