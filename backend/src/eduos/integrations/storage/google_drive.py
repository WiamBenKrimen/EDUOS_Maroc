import json
import re
import uuid
from dataclasses import dataclass
from email.message import Message
from pathlib import Path
from typing import BinaryIO
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

DRIVE_PREFIX = "gdrive:"
DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"
DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file"
DRIVE_API = "https://www.googleapis.com/drive/v3"
DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
RESUMABLE_UPLOAD_THRESHOLD = 5 * 1024 * 1024


class DriveStorageError(RuntimeError):
    pass


class DriveNotConfiguredError(DriveStorageError):
    pass


@dataclass(frozen=True)
class DriveUpload:
    file_id: str
    name: str
    mime_type: str
    size: int | None


@dataclass(frozen=True)
class DriveDownload:
    content: bytes
    name: str
    mime_type: str


@dataclass(frozen=True)
class DriveThumbnail:
    content: bytes
    mime_type: str


@dataclass(frozen=True)
class _AuthResponse:
    status: int
    data: bytes
    headers: object


class _UrllibAuthRequest:
    """Minimal google-auth transport implemented with Python's stdlib."""

    def __call__(
        self,
        url: str,
        method: str = "GET",
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
        timeout: float | None = None,
        **_kwargs,
    ) -> _AuthResponse:
        request = Request(url, data=body, headers=headers or {}, method=method)
        try:
            with urlopen(request, timeout=timeout or 30) as response:
                return _AuthResponse(
                    response.status,
                    response.read(),
                    response.headers,
                )
        except HTTPError as exc:
            return _AuthResponse(exc.code, exc.read(), exc.headers)


def drive_storage_key(file_id: str) -> str:
    return f"{DRIVE_PREFIX}{file_id}"


def drive_file_id(storage_key: str | None) -> str | None:
    if not storage_key or not storage_key.startswith(DRIVE_PREFIX):
        return None
    file_id = storage_key.removeprefix(DRIVE_PREFIX).strip()
    return file_id or None


class GoogleDriveStorage:
    """Private Drive storage using OAuth or a Shared Drive service account."""

    def __init__(
        self,
        credentials_file: str | None = None,
        folder_id: str | None = None,
        *,
        oauth_client_id: str | None = None,
        oauth_client_secret: str | None = None,
        refresh_token: str | None = None,
        access_token: str | None = None,
    ):
        self.credentials_file = credentials_file
        self.folder_id = folder_id
        self.oauth_client_id = oauth_client_id
        self.oauth_client_secret = oauth_client_secret
        self.refresh_token = refresh_token
        self.access_token = access_token

    @classmethod
    def from_oauth(
        cls,
        client_id: str,
        client_secret: str,
        refresh_token: str,
        folder_id: str,
    ) -> "GoogleDriveStorage":
        return cls(
            folder_id=folder_id,
            oauth_client_id=client_id,
            oauth_client_secret=client_secret,
            refresh_token=refresh_token,
        )

    @classmethod
    def from_access_token(
        cls,
        access_token: str,
        folder_id: str | None = None,
    ) -> "GoogleDriveStorage":
        return cls(folder_id=folder_id, access_token=access_token)

    def _oauth_access_token(self) -> str:
        if not (
            self.oauth_client_id
            and self.oauth_client_secret
            and self.refresh_token
        ):
            raise DriveNotConfiguredError(
                "La connexion OAuth Google Drive est incomplète."
            )
        payload = urlencode(
            {
                "client_id": self.oauth_client_id,
                "client_secret": self.oauth_client_secret,
                "refresh_token": self.refresh_token,
                "grant_type": "refresh_token",
            }
        ).encode()
        request = Request(
            GOOGLE_TOKEN_URL,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=30) as response:
                result = json.loads(response.read())
            token = result.get("access_token")
            if not token:
                raise DriveStorageError(
                    "Google n'a pas renvoyé de jeton d'accès."
                )
            self.access_token = token
            return token
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "La session Google Drive doit être reconnectée."
            ) from exc

    def _service_account_access_token(self) -> str:
        if not self.credentials_file:
            raise DriveNotConfiguredError(
                "Google Drive n'est pas configuré sur le serveur."
            )
        credentials_path = Path(self.credentials_file).expanduser().resolve()
        if not credentials_path.is_file():
            raise DriveNotConfiguredError(
                "Le fichier d'identifiants Google Drive est introuvable."
            )
        try:
            from google.oauth2 import service_account

            credentials = service_account.Credentials.from_service_account_file(
                str(credentials_path),
                scopes=[DRIVE_SCOPE],
            )
            credentials.refresh(_UrllibAuthRequest())
            if not credentials.token:
                raise DriveStorageError(
                    "Google Drive n'a pas renvoyé de jeton d'accès."
                )
            return credentials.token
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "Connexion à Google Drive impossible."
            ) from exc

    def _access_token(self) -> str:
        if self.access_token:
            return self.access_token
        if self.refresh_token:
            return self._oauth_access_token()
        return self._service_account_access_token()

    def _request(
        self,
        url: str,
        method: str = "GET",
        body: bytes | None = None,
        content_type: str | None = None,
        *,
        extra_headers: dict[str, str] | None = None,
        timeout: float = 120,
    ) -> tuple[bytes, Message]:
        headers = {"Authorization": f"Bearer {self._access_token()}"}
        if content_type:
            headers["Content-Type"] = content_type
        if extra_headers:
            headers.update(extra_headers)
        request = Request(url, data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=timeout) as response:
                return response.read(), response.headers
        except (HTTPError, URLError, TimeoutError) as exc:
            raise DriveStorageError(
                "La requête envoyée à Google Drive a échoué."
            ) from exc

    def create_folder(self, name: str = "EDUOS Ressources") -> str:
        body = json.dumps(
            {
                "name": name,
                "mimeType": "application/vnd.google-apps.folder",
                "appProperties": {"eduos_source": "resource_root"},
            },
            ensure_ascii=False,
        ).encode()
        response, _headers = self._request(
            f"{DRIVE_API}/files?fields=id,name",
            method="POST",
            body=body,
            content_type="application/json; charset=UTF-8",
        )
        result = json.loads(response)
        folder_id = result.get("id")
        if not folder_id:
            raise DriveStorageError(
                "Google Drive n'a pas créé le dossier EDUOS."
            )
        self.folder_id = folder_id
        return folder_id

    def upload(
        self,
        stream: BinaryIO,
        name: str,
        mime_type: str,
        cohort_id: str,
    ) -> DriveUpload:
        if not self.folder_id:
            raise DriveNotConfiguredError(
                "Le dossier Google Drive EDUOS n'est pas configuré."
            )
        boundary = f"eduos_{uuid.uuid4().hex}"
        metadata = json.dumps(
            {
                "name": name,
                "parents": [self.folder_id],
                "appProperties": {
                    "eduos_cohort_id": cohort_id,
                    "eduos_source": "teaching_resource",
                },
            },
            ensure_ascii=False,
        ).encode("utf-8")
        stream.seek(0)
        content = stream.read()
        if len(content) >= RESUMABLE_UPLOAD_THRESHOLD:
            return self._resumable_upload(
                content,
                name,
                mime_type,
                cohort_id,
            )
        body = b"".join(
            (
                f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8"
                "\r\n\r\n".encode(),
                metadata,
                f"\r\n--{boundary}\r\nContent-Type: {mime_type}\r\n\r\n".encode(),
                content,
                f"\r\n--{boundary}--".encode(),
            )
        )
        query = urlencode(
            {
                "uploadType": "multipart",
                "supportsAllDrives": "true",
                "fields": "id,name,mimeType,size",
            }
        )
        try:
            response, _headers = self._request(
                f"{DRIVE_UPLOAD_API}/files?{query}",
                method="POST",
                body=body,
                content_type=f"multipart/related; boundary={boundary}",
            )
            result = json.loads(response)
            size = int(result["size"]) if result.get("size") else len(content)
            return DriveUpload(
                file_id=result["id"],
                name=result.get("name", name),
                mime_type=result.get("mimeType", mime_type),
                size=size,
            )
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "L'envoi du fichier vers Google Drive a échoué."
            ) from exc

    def _resumable_upload(
        self,
        content: bytes,
        name: str,
        mime_type: str,
        cohort_id: str,
    ) -> DriveUpload:
        try:
            upload_url = self.initiate_resumable_upload(
                name,
                mime_type,
                len(content),
                cohort_id,
            )
            response, _headers = self._request(
                upload_url,
                method="PUT",
                body=content,
                content_type=mime_type,
                timeout=600,
            )
            result = json.loads(response)
            size = int(result["size"]) if result.get("size") else len(content)
            return DriveUpload(
                file_id=result["id"],
                name=result.get("name", name),
                mime_type=result.get("mimeType", mime_type),
                size=size,
            )
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "L'envoi de la vidéo vers Google Drive a échoué."
            ) from exc

    def initiate_resumable_upload(
        self,
        name: str,
        mime_type: str,
        size: int,
        cohort_id: str,
    ) -> str:
        if not self.folder_id:
            raise DriveNotConfiguredError(
                "Le dossier Google Drive EDUOS n'est pas configuré."
            )
        metadata = json.dumps(
            {
                "name": name,
                "parents": [self.folder_id],
                "appProperties": {
                    "eduos_cohort_id": cohort_id,
                    "eduos_source": "teaching_resource",
                },
            },
            ensure_ascii=False,
        ).encode("utf-8")
        query = urlencode(
            {
                "uploadType": "resumable",
                "supportsAllDrives": "true",
                "fields": "id,name,mimeType,size",
            }
        )
        _body, headers = self._request(
            f"{DRIVE_UPLOAD_API}/files?{query}",
            method="POST",
            body=metadata,
            content_type="application/json; charset=UTF-8",
            extra_headers={
                "X-Upload-Content-Type": mime_type,
                "X-Upload-Content-Length": str(size),
            },
        )
        upload_url = headers.get("Location")
        if not upload_url:
            raise DriveStorageError(
                "Google Drive n'a pas initialisé l'envoi du fichier."
            )
        return upload_url

    def verify_uploaded_file(
        self,
        file_id: str,
        cohort_id: str,
        expected_size: int,
    ) -> DriveUpload:
        if not self.folder_id:
            raise DriveNotConfiguredError(
                "Le dossier Google Drive EDUOS n'est pas configuré."
            )
        encoded_id = quote(file_id, safe="")
        query = urlencode(
            {
                "fields": "id,name,mimeType,size,parents,appProperties",
                "supportsAllDrives": "true",
            }
        )
        try:
            body, _headers = self._request(
                f"{DRIVE_API}/files/{encoded_id}?{query}"
            )
            result = json.loads(body)
            properties = result.get("appProperties") or {}
            parents = result.get("parents") or []
            size = int(result.get("size") or 0)
            if (
                self.folder_id not in parents
                or properties.get("eduos_cohort_id") != cohort_id
                or properties.get("eduos_source") != "teaching_resource"
                or size != expected_size
            ):
                raise DriveStorageError(
                    "Le fichier reçu par Google Drive ne correspond pas à l'envoi EDUOS."
                )
            return DriveUpload(
                file_id=result["id"],
                name=result.get("name", "ressource"),
                mime_type=result.get("mimeType", "application/octet-stream"),
                size=size,
            )
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "Impossible de vérifier le fichier envoyé à Google Drive."
            ) from exc

    def download(self, file_id: str) -> DriveDownload:
        encoded_id = quote(file_id, safe="")
        metadata_query = urlencode(
            {"fields": "id,name,mimeType", "supportsAllDrives": "true"}
        )
        try:
            metadata_body, _headers = self._request(
                f"{DRIVE_API}/files/{encoded_id}?{metadata_query}"
            )
            metadata = json.loads(metadata_body)
            media_query = urlencode(
                {"alt": "media", "supportsAllDrives": "true"}
            )
            content, _headers = self._request(
                f"{DRIVE_API}/files/{encoded_id}?{media_query}"
            )
            return DriveDownload(
                content=content,
                name=metadata.get("name", "ressource"),
                mime_type=metadata.get("mimeType", "application/octet-stream"),
            )
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "Le téléchargement depuis Google Drive a échoué."
            ) from exc

    def thumbnail(self, file_id: str) -> DriveThumbnail | None:
        """Return Google's generated preview without downloading the source file."""
        encoded_id = quote(file_id, safe="")
        metadata_query = urlencode(
            {"fields": "id,thumbnailLink", "supportsAllDrives": "true"}
        )
        try:
            metadata_body, _headers = self._request(
                f"{DRIVE_API}/files/{encoded_id}?{metadata_query}"
            )
            thumbnail_link = json.loads(metadata_body).get("thumbnailLink")
            if not thumbnail_link:
                return None

            # Drive defaults to a tiny thumbnail. Request a card-ready version.
            thumbnail_link = re.sub(r"=s\d+$", "=w1200", thumbnail_link)
            content, headers = self._request(thumbnail_link, timeout=45)
            return DriveThumbnail(
                content=content,
                mime_type=headers.get_content_type() or "image/jpeg",
            )
        except DriveStorageError:
            raise
        except Exception as exc:
            raise DriveStorageError(
                "La miniature Google Drive n'a pas pu être chargée."
            ) from exc

    def delete(self, file_id: str) -> None:
        encoded_id = quote(file_id, safe="")
        try:
            self._request(
                f"{DRIVE_API}/files/{encoded_id}?supportsAllDrives=true",
                method="DELETE",
            )
        except DriveStorageError:
            return
