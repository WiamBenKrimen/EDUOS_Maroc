import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID

import asyncpg
import jwt
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from eduos.core.config import Settings, get_settings
from eduos.integrations.storage.google_drive import (
    DriveStorageError,
    GoogleDriveStorage,
)
from eduos.integrations.storage.google_oauth import (
    GoogleOAuthError,
    account_email,
    authorization_url,
    exchange_code,
)
from eduos.modules.google_drive import repository

STATE_PURPOSE = "google_drive_oauth"


def _oauth_settings(settings: Settings) -> tuple[str, str, str]:
    client_id = settings.google_drive_oauth_client_id
    client_secret = settings.google_drive_oauth_client_secret
    if settings.google_drive_oauth_client_file:
        try:
            path = Path(settings.google_drive_oauth_client_file).expanduser()
            document = json.loads(path.read_text(encoding="utf-8"))
            web = document["web"]
            client_id = web["client_id"]
            client_secret = web["client_secret"]
        except (OSError, KeyError, TypeError, ValueError) as exc:
            raise HTTPException(
                503,
                "Le fichier OAuth Google Drive est invalide ou introuvable.",
            ) from exc
    if not (client_id and client_secret):
        raise HTTPException(
            503,
            "Le client OAuth Google Drive n'est pas encore configuré.",
        )
    return (
        client_id,
        client_secret,
        settings.google_drive_oauth_redirect_uri,
    )


def _state_token(user: asyncpg.Record, settings: Settings) -> str:
    payload = {
        "sub": str(user["id"]),
        "centre_id": str(user["centre_id"]),
        "fonction": user["personnel_fonction"],
        "purpose": STATE_PURPOSE,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def _decode_state(state: str, settings: Settings) -> dict:
    try:
        payload = jwt.decode(
            state,
            settings.jwt_secret,
            algorithms=["HS256"],
            options={"require": ["sub", "centre_id", "purpose", "exp"]},
        )
        if payload["purpose"] != STATE_PURPOSE:
            raise ValueError
        payload["user_id"] = UUID(payload["sub"])
        payload["centre_uuid"] = UUID(payload["centre_id"])
        return payload
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise HTTPException(400, "État OAuth Google invalide ou expiré.") from None


async def connection_status(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> dict:
    settings = get_settings()
    try:
        _oauth_settings(settings)
        configured = True
    except HTTPException:
        configured = False
    connection = await repository.get_connection(
        pool,
        centre_id,
        settings.jwt_secret,
    )
    return {
        "configured": configured,
        "connected": connection is not None,
        "account_email": connection["account_email"] if connection else None,
    }


def start_authorization(user: asyncpg.Record) -> dict:
    settings = get_settings()
    client_id, _client_secret, redirect_uri = _oauth_settings(settings)
    return {
        "authorization_url": authorization_url(
            client_id,
            redirect_uri,
            _state_token(user, settings),
        )
    }


async def complete_authorization(
    pool: asyncpg.Pool,
    code: str,
    state: str,
) -> str:
    settings = get_settings()
    client_id, client_secret, redirect_uri = _oauth_settings(settings)
    state_data = _decode_state(state, settings)
    user = await repository.get_teaching_user(
        pool,
        state_data["user_id"],
        state_data["centre_uuid"],
    )
    if not user:
        raise HTTPException(403, "Compte formateur Google non autorisé.")
    try:
        tokens = await run_in_threadpool(
            exchange_code,
            client_id,
            client_secret,
            redirect_uri,
            code,
        )
        storage = GoogleDriveStorage.from_access_token(tokens.access_token)
        folder_id = await run_in_threadpool(storage.create_folder)
        email = await run_in_threadpool(account_email, tokens.access_token)
    except (GoogleOAuthError, DriveStorageError) as exc:
        raise HTTPException(502, str(exc)) from exc
    await repository.upsert_connection(
        pool,
        state_data["centre_uuid"],
        state_data["user_id"],
        tokens.refresh_token,
        folder_id,
        email,
        settings.jwt_secret,
    )
    fonction = state_data.get("fonction")
    space = "enseignant" if fonction == "enseignant" else "formateur"
    frontend = settings.cors_origin.rstrip("/")
    return f"{frontend}/personnel/{space}/ressources?drive=connected"


async def disconnect(pool: asyncpg.Pool, centre_id: UUID) -> dict:
    disconnected = await repository.delete_connection(pool, centre_id)
    return {"disconnected": disconnected}


async def storage_for_centre(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> GoogleDriveStorage:
    settings = get_settings()
    connection = await repository.get_connection(
        pool,
        centre_id,
        settings.jwt_secret,
    )
    if connection:
        client_id, client_secret, _redirect_uri = _oauth_settings(settings)
        return GoogleDriveStorage.from_oauth(
            client_id,
            client_secret,
            connection["refresh_token"],
            connection["folder_id"],
        )
    if settings.google_drive_service_account_file:
        return GoogleDriveStorage(
            settings.google_drive_service_account_file,
            settings.google_drive_folder_id,
        )
    raise HTTPException(503, "Google Drive n'est pas connecté.")
