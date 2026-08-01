import json
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from eduos.integrations.storage.google_drive import DRIVE_FILE_SCOPE

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
OAUTH_SCOPES = f"openid email {DRIVE_FILE_SCOPE}"


class GoogleOAuthError(RuntimeError):
    pass


@dataclass(frozen=True)
class GoogleOAuthTokens:
    access_token: str
    refresh_token: str


def authorization_url(client_id: str, redirect_uri: str, state: str) -> str:
    query = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": OAUTH_SCOPES,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "consent select_account",
            "state": state,
        }
    )
    return f"{GOOGLE_AUTH_URL}?{query}"


def exchange_code(
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    code: str,
) -> GoogleOAuthTokens:
    payload = urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "code": code,
            "grant_type": "authorization_code",
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
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise GoogleOAuthError(
            "Google a refusé la connexion OAuth."
        ) from exc
    access_token = result.get("access_token")
    refresh_token = result.get("refresh_token")
    if not access_token or not refresh_token:
        raise GoogleOAuthError(
            "Google n'a pas fourni l'accès hors ligne demandé."
        )
    return GoogleOAuthTokens(access_token, refresh_token)


def account_email(access_token: str) -> str | None:
    request = Request(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read())
        return result.get("email")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return None
