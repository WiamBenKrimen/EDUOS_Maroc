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
            with urlopen(req, timeout=15) as resp:
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
            if "introuvable" in str(e).lower() or "not found" in str(e).lower() or "404" in str(e):
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

    @staticmethod
    def _normalize_phone(telephone: str) -> str:
        """Normalize phone number to international format (no + prefix).
        Moroccan numbers starting with 0 (06XXXXXXXX, 07XXXXXXXX) → 212XXXXXXXXX
        """
        number = re.sub(r"\D", "", telephone)
        if not number:
            return ""
        # Already has country code (starts with 212 or other)
        if number.startswith("212") and len(number) >= 12:
            return number
        # Moroccan local format: 0XXXXXXXXX (10 digits)
        if number.startswith("0") and len(number) >= 9:
            return "212" + number[1:]
        # If already without leading 0 and looks like Moroccan (9 digits starting with 6 or 7)
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
        
        # Evolution API v2 format
        payload = {
            "number": number,
            "text": message,
        }
        self._request(f"/message/sendText/{quote(target_instance, safe='')}", method="POST", payload=payload)
