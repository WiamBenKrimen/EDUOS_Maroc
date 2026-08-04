import json
import re
from typing import Optional
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


class EvolutionAPIError(RuntimeError):
    pass


class EvolutionWhatsAppClient:
    def __init__(self, base_url: str, api_key: str, default_instance: str = "eduos-whatsapp"):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.default_instance = default_instance

    def _request(self, path: str, method: str = "GET", payload: Optional[dict] = None) -> dict:
        url = f"{self.base_url}{path}"
        headers = {"apikey": self.api_key}
        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        
        req = Request(url, data=data, headers=headers, method=method)
        try:
            with urlopen(req, timeout=30) as resp:
                res_data = resp.read().decode("utf-8")
                return json.loads(res_data) if res_data else {}
        except HTTPError as exc:
            error_msg = f"Evolution API error HTTP {exc.code}"
            try:
                err_body = json.loads(exc.read().decode("utf-8"))
                msg = err_body.get("response", {}).get("message") or err_body.get("error") or ""
                if isinstance(msg, list):
                    msg = ", ".join(str(m) for m in msg)
                if msg:
                    error_msg = f"Evolution API: {msg}"
            except Exception:  # noqa: BLE001
                pass
            raise EvolutionAPIError(error_msg) from exc
        except (URLError, TimeoutError) as exc:
            raise EvolutionAPIError("Evolution API est inaccessible.") from exc

    def get_connection_state(self, instance_name: str) -> dict:
        try:
            res = self._request(f"/instance/connectionState/{quote(instance_name, safe='')}")
            instance_data = res.get("instance", {})
            return {
                "state": instance_data.get("state", "disconnected"),
                "status": res.get("status")
            }
        except EvolutionAPIError as e:
            error_message = str(e).lower()
            if any(
                marker in error_message
                for marker in (
                    "introuvable",
                    "not found",
                    "does not exist",
                    "n'existe pas",
                    "404",
                )
            ):
                return {"state": "not_created"}
            return {"state": "disconnected", "error": str(e)}

    def create_instance(self, instance_name: str) -> dict:
        payload = {
            "instanceName": instance_name,
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS"
        }
        return self._request("/instance/create", method="POST", payload=payload)

    def get_qr_code(self, instance_name: str) -> Optional[str]:
        try:
            res = self._request(f"/instance/connect/{quote(instance_name, safe='')}")
            return res.get("base64") or res.get("code")
        except EvolutionAPIError:
            return None

    def logout_instance(self, instance_name: str) -> bool:
        try:
            self._request(f"/instance/logout/{quote(instance_name, safe='')}", method="DELETE")
            return True
        except EvolutionAPIError:
            return False

    def set_webhook(self, instance_name: str, webhook_url: str) -> None:
        payload = {
            "webhook": {
                "enabled": True,
                "url": webhook_url,
                "byEvents": False,
                "events": ["MESSAGES_UPSERT"]
            }
        }
        try:
            self._request(f"/webhook/set/{quote(instance_name, safe='')}", method="POST", payload=payload)
        except EvolutionAPIError:
            pass

    def fetch_messages_for_number(self, instance_name: str, telephone: str) -> list[dict]:
        """Fetch messages from Evolution API for a specific phone number."""
        number = self._normalize_phone(telephone)
        if not number:
            return []
        remote_jid = f"{number}@s.whatsapp.net"
        payload = {
            "where": {
                "key": {
                    "remoteJid": remote_jid
                }
            }
        }
        try:
            res = self._request(f"/chat/findMessages/{quote(instance_name, safe='')}", method="POST", payload=payload)
            messages_data = res.get("messages", {})
            if isinstance(messages_data, dict):
                return messages_data.get("records", [])
            elif isinstance(messages_data, list):
                return messages_data
            return []
        except EvolutionAPIError:
            return []

    def get_media_base64(self, instance_name: str, message_record: dict) -> Optional[dict]:
        """Download and decrypt media base64 from WhatsApp media message."""
        payload = {
            "message": message_record,
            "convertToMp4": False
        }
        try:
            return self._request(f"/chat/getBase64FromMediaMessage/{quote(instance_name, safe='')}", method="POST", payload=payload)
        except EvolutionAPIError:
            return None

    @staticmethod
    def _normalize_phone(telephone: str) -> str:
        """Normalize phone number to international format (no + prefix).
        Moroccan numbers starting with 0 (06XXXXXXXX, 07XXXXXXXX) → 212XXXXXXXXX
        """
        number = re.sub(r"\D", "", telephone)
        if not number:
            return ""
        if number.startswith("212") and len(number) >= 12:
            return number
        if number.startswith("0") and len(number) >= 9:
            return "212" + number[1:]
        if len(number) == 9 and number[0] in ("6", "7"):
            return "212" + number
        return number

    def send_text(self, telephone: str, message: str, instance_name: Optional[str] = None) -> None:
        target_instance = instance_name or self.default_instance
        number = self._normalize_phone(telephone)
        if not number:
            raise EvolutionAPIError("Le destinataire ne possède pas de numéro WhatsApp valide.")
        if len(number) < 10:
            raise EvolutionAPIError(f"Numéro invalide : '{telephone}'. Format attendu : 06XXXXXXXX ou +212XXXXXXXXX.")
        
        payload = {
            "number": number,
            "text": message,
        }
        self._request(f"/message/sendText/{quote(target_instance, safe='')}", method="POST", payload=payload)

    def send_media(
        self,
        telephone: str,
        media_base64: str,
        mediatype: str,
        filename: str,
        caption: Optional[str] = None,
        mimetype: Optional[str] = None,
        instance_name: Optional[str] = None,
    ) -> None:
        target_instance = instance_name or self.default_instance
        number = self._normalize_phone(telephone)
        if not number:
            raise EvolutionAPIError("Le destinataire ne possède pas de numéro WhatsApp valide.")
        
        clean_b64 = media_base64
        if "base64," in clean_b64:
            clean_b64 = clean_b64.split("base64,")[-1]
        clean_b64 = re.sub(r"\s+", "", clean_b64)
        missing = len(clean_b64) % 4
        if missing:
            clean_b64 += "=" * (4 - missing)

        payload = {
            "number": number,
            "media": clean_b64,
            "mediatype": mediatype,
            "mimetype": mimetype or "application/octet-stream",
            "fileName": filename,
            "caption": caption or "",
        }
        self._request(f"/message/sendMedia/{quote(target_instance, safe='')}", method="POST", payload=payload)
