import re
from urllib.parse import quote

from fastapi import HTTPException, Response


def database_file_response(item, *, inline: bool = True) -> Response:
    content = item["file_content"]
    if content is None:
        raise HTTPException(
            404,
            "Ce fichier n'est pas encore enregistré dans la base de données.",
        )

    name = item["file_name"] or item["titre"] or "ressource"
    mime_type = item["mime_type"] or "application/octet-stream"
    ascii_name = re.sub(r"[^A-Za-z0-9._-]", "_", name) or "ressource"
    disposition_type = "inline" if inline else "attachment"
    disposition = (
        f'{disposition_type}; filename="{ascii_name}"; '
        f"filename*=UTF-8''{quote(name)}"
    )
    return Response(
        content=bytes(content),
        media_type=mime_type,
        headers={"Content-Disposition": disposition},
    )


def database_thumbnail_response(item) -> Response:
    mime_type = item["mime_type"] or ""
    content = item["file_content"]
    if content is None or not mime_type.startswith("image/"):
        raise HTTPException(404, "Aucune miniature disponible.")
    return Response(
        content=bytes(content),
        media_type=mime_type,
        headers={"Cache-Control": "private, max-age=300"},
    )
