from collections.abc import Mapping
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

import jwt
from fastapi import HTTPException, status

from eduos.core.config import get_settings


def create_token(user: Mapping[str, Any]) -> str:
    settings = get_settings()
    payload = {
        "sub": str(user["id"]),
        "role": user["role"],
        "centreId": str(user["centre_id"]) if user["centre_id"] else None,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=settings.jwt_expires_in_hours),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_subject(token: str) -> UUID:
    try:
        payload = jwt.decode(
            token,
            get_settings().jwt_secret,
            algorithms=["HS256"],
            options={"require": ["sub", "exp"]},
        )
        return UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Jeton invalide ou expiré.",
        ) from None
