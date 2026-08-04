import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class NVIDIAAPIError(RuntimeError):
    pass


class NVIDIAChatClient:
    def __init__(self, base_url: str, api_key: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model

    def complete(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "messages": messages,
            "tools": tools,
            "tool_choice": "auto",
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 3000,
            "stream": False,
        }
        request = Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=60) as response:
                body = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code in {401, 403}:
                error_message = "La clé NVIDIA est invalide ou n'est plus autorisée."
            elif exc.code == 429:
                error_message = (
                    "La limite NVIDIA est atteinte. Réessayez dans un instant."
                )
            else:
                error_message = (
                    f"Le service NVIDIA a répondu avec l'erreur HTTP {exc.code}."
                )
            raise NVIDIAAPIError(error_message) from exc
        except (URLError, TimeoutError) as exc:
            raise NVIDIAAPIError(
                "Le service NVIDIA est momentanément inaccessible."
            ) from exc
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            raise NVIDIAAPIError("La réponse NVIDIA est invalide.") from exc

        choices = body.get("choices") or []
        if not choices or not isinstance(choices[0], dict):
            raise NVIDIAAPIError("NVIDIA n'a retourné aucune réponse.")
        message = choices[0].get("message")
        if not isinstance(message, dict):
            raise NVIDIAAPIError("La réponse NVIDIA est incomplète.")
        return message
