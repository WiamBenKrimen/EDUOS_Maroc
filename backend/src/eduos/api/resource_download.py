import re
from urllib.parse import quote

from fastapi import HTTPException, Response
from starlette.concurrency import run_in_threadpool

from eduos.integrations.storage.google_drive import (
    DriveNotConfiguredError,
    DriveStorageError,
    drive_file_id,
)
from eduos.modules.google_drive import service as google_drive_service


async def google_drive_response(
    pool,
    centre_id,
    storage_key: str | None,
) -> Response:
    file_id = drive_file_id(storage_key)
    if not file_id:
        raise HTTPException(404, "Aucun fichier Google Drive associé.")

    storage = await google_drive_service.storage_for_centre(pool, centre_id)
    try:
        item = await run_in_threadpool(storage.download, file_id)
    except DriveNotConfiguredError as exc:
        raise HTTPException(503, str(exc)) from exc
    except DriveStorageError as exc:
        raise HTTPException(502, str(exc)) from exc

    ascii_name = re.sub(r"[^A-Za-z0-9._-]", "_", item.name) or "ressource"
    disposition = (
        f'inline; filename="{ascii_name}"; '
        f"filename*=UTF-8''{quote(item.name)}"
    )
    return Response(
        content=item.content,
        media_type=item.mime_type,
        headers={"Content-Disposition": disposition},
    )


async def google_drive_thumbnail_response(
    pool,
    centre_id,
    storage_key: str | None,
) -> Response:
    file_id = drive_file_id(storage_key)
    if not file_id:
        raise HTTPException(404, "Aucune miniature disponible.")

    storage = await google_drive_service.storage_for_centre(pool, centre_id)
    try:
        item = await run_in_threadpool(storage.thumbnail, file_id)
    except DriveNotConfiguredError as exc:
        raise HTTPException(503, str(exc)) from exc
    except DriveStorageError as exc:
        raise HTTPException(502, str(exc)) from exc

    if item is None:
        raise HTTPException(404, "Aucune miniature disponible.")
    return Response(
        content=item.content,
        media_type=item.mime_type,
        headers={"Cache-Control": "private, max-age=300"},
    )
