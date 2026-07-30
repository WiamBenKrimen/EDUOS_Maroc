from datetime import datetime, timedelta, timezone
from typing import Annotated

import asyncpg
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

bearer = HTTPBearer(auto_error=False)


def create_token(user: asyncpg.Record) -> str:
    settings = get_settings()
    payload = {
        "sub": str(user["id"]), "role": user["role"],
        "centreId": str(user["centre_id"]) if user["centre_id"] else None,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expires_in_hours),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


async def current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> asyncpg.Record:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentification requise.")
    try:
        payload = jwt.decode(credentials.credentials, get_settings().jwt_secret, algorithms=["HS256"])
        user_id = payload["sub"]
    except (jwt.PyJWTError, KeyError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Jeton invalide ou expiré.")
    user = await request.app.state.pool.fetchrow(
        "SELECT id, centre_id, role, personnel_fonction, nom, prenom, email FROM users WHERE id = $1 AND statut = 'actif'",
        user_id,
    )
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Utilisateur introuvable ou inactif.")
    return user


async def directeur_required(user: Annotated[asyncpg.Record, Depends(current_user)]) -> asyncpg.Record:
    if user["role"] != "directeur":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès réservé au directeur.")
    return user
