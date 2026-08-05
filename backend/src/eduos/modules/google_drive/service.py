import json
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
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
GOOGLE_CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1"


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
        email = await run_in_threadpool(account_email, tokens.access_token)
    except GoogleOAuthError as exc:
        raise HTTPException(502, str(exc)) from exc
    await repository.upsert_connection(
        pool,
        state_data["centre_uuid"],
        state_data["user_id"],
        tokens.refresh_token,
        "calendar-only",
        email,
        settings.jwt_secret,
    )
    frontend = settings.cors_origin.rstrip("/")
    return f"{frontend}/personnel/enseignant/seances-en-ligne?google=connected"


async def disconnect(pool: asyncpg.Pool, centre_id: UUID) -> dict:
    disconnected = await repository.delete_connection(pool, centre_id)
    return {"disconnected": disconnected}


def _create_meet_event(storage: GoogleDriveStorage, title: str, starts_at, ends_at: object) -> str:
    body = json.dumps({
        "summary": title,
        "start": {"dateTime": starts_at.isoformat()},
        "end": {"dateTime": ends_at.isoformat()},
        "conferenceData": {"createRequest": {"requestId": uuid.uuid4().hex, "conferenceSolutionKey": {"type": "hangoutsMeet"}}},
    }).encode("utf-8")
    request = Request(GOOGLE_CALENDAR_EVENTS_URL, data=body, method="POST", headers={
        "Authorization": f"Bearer {storage._access_token()}",
        "Content-Type": "application/json",
    })
    try:
        with urlopen(request, timeout=30) as response:
            event = json.loads(response.read())
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise GoogleOAuthError("Google Meet n'a pas pu être créé. Reconnectez votre compte Google en autorisant Google Calendar.") from exc
    meeting_url = event.get("hangoutLink")
    if not meeting_url:
        entry_points = (event.get("conferenceData") or {}).get("entryPoints") or []
        meeting_url = next((item.get("uri") for item in entry_points if item.get("entryPointType") == "video"), None)
    if not meeting_url:
        raise GoogleOAuthError("Google n'a pas renvoyé le lien Google Meet.")
    return meeting_url


async def create_google_meet(pool: asyncpg.Pool, centre_id: UUID, title: str, starts_at, ends_at) -> str:
    settings = get_settings()
    connection = await repository.get_connection(pool, centre_id, settings.jwt_secret)
    if not connection:
        raise HTTPException(409, "Connectez d'abord votre compte Google pour démarrer un Meet.")
    client_id, client_secret, _redirect_uri = _oauth_settings(settings)
    storage = GoogleDriveStorage.from_oauth(client_id, client_secret, connection["refresh_token"], connection["folder_id"])
    try:
        return await run_in_threadpool(_create_meet_event, storage, title, starts_at, ends_at)
    except GoogleOAuthError as exc:
        raise HTTPException(502, str(exc)) from exc


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
