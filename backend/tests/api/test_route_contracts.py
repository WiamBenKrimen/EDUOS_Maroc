import unittest

from eduos.main import app

EXPECTED_ROUTES = {
    ("POST", "/api/auth/login"),
    ("GET", "/api/auth/me"),
    ("GET", "/api/health"),
    ("GET", "/api/health/db"),
    ("GET", "/api/director/dashboard"),
    ("GET", "/api/director/personnel"),
    ("POST", "/api/director/personnel"),
    ("GET", "/api/director/prospects"),
    ("POST", "/api/director/prospects"),
    ("PATCH", "/api/director/prospects/{prospect_id}/statut"),
    ("GET", "/api/director/formations"),
    ("POST", "/api/director/formations"),
    ("GET", "/api/director/cohortes"),
    ("POST", "/api/director/cohortes"),
    ("PATCH", "/api/director/cohortes/{cohorte_id}"),
    ("GET", "/api/director/planning"),
    ("POST", "/api/director/planning"),
    ("PATCH", "/api/director/planning/{seance_id}"),
    ("DELETE", "/api/director/planning/{seance_id}"),
    ("GET", "/api/director/planning/requests"),
    ("PATCH", "/api/director/planning/requests/{request_id}"),
    ("GET", "/api/director/enrollment-options"),
    ("POST", "/api/director/enrollments"),
    ("GET", "/api/director/financial"),
    ("GET", "/api/director/paiements"),
    ("POST", "/api/director/payments"),
    ("GET", "/api/director/renewals"),
    ("PATCH", "/api/director/renewals/{renewal_id}"),
    ("GET", "/api/director/attestations"),
    ("POST", "/api/director/attestations/generate"),
    ("GET", "/api/director/reports"),
    ("GET", "/api/director/remunerations"),
    ("PATCH", "/api/director/remunerations/{remuneration_id}"),
    ("GET", "/api/director/reminder-rules"),
    ("PATCH", "/api/director/reminder-rules/{rule_id}"),
    ("POST", "/api/director/reminders/send"),
    ("GET", "/api/director/notifications"),
    ("PATCH", "/api/director/notifications/read-all"),
    ("GET", "/api/director/whatsapp/contacts"),
    ("POST", "/api/director/whatsapp/messages"),
    ("GET", "/api/personnel/dashboard"),
    ("GET", "/api/personnel/cohorts"),
    ("GET", "/api/personnel/planning"),
    ("POST", "/api/personnel/planning/{session_id}/change-requests"),
    ("GET", "/api/personnel/attendance/sessions"),
    ("GET", "/api/personnel/attendance/{session_id}"),
    ("PUT", "/api/personnel/attendance/{session_id}"),
    ("GET", "/api/personnel/resources"),
    ("POST", "/api/personnel/resources"),
    ("POST", "/api/personnel/resources/upload"),
    ("GET", "/api/personnel/resources/google/status"),
    ("GET", "/api/personnel/resources/google/authorize"),
    ("GET", "/api/personnel/resources/google/callback"),
    ("DELETE", "/api/personnel/resources/google/connection"),
    ("GET", "/api/personnel/resources/{resource_id}/download"),
    ("GET", "/api/personnel/evaluations"),
    ("POST", "/api/personnel/evaluations"),
    ("GET", "/api/personnel/contacts"),
    ("GET", "/api/personnel/tickets"),
    ("POST", "/api/personnel/tickets"),
    ("POST", "/api/personnel/tickets/{ticket_id}/messages"),
    ("PATCH", "/api/personnel/tickets/{ticket_id}"),
    ("GET", "/api/personnel/grades"),
    ("PUT", "/api/personnel/grades"),
    ("GET", "/api/participant/dashboard"),
    ("GET", "/api/participant/payments"),
    ("GET", "/api/participant/documents"),
    ("GET", "/api/participant/reports"),
    ("GET", "/api/participant/resources"),
    ("GET", "/api/participant/resources/{resource_id}/download"),
    ("PATCH", "/api/participant/resources/{resource_id}/progress"),
    ("GET", "/api/participant/evaluations"),
    ("GET", "/api/participant/evaluations/{evaluation_id}"),
    ("POST", "/api/participant/evaluations/{evaluation_id}/submit"),
    ("GET", "/api/participant/notifications"),
    ("PATCH", "/api/participant/notifications/read-all"),
    ("PATCH", "/api/participant/notifications/{notification_id}/read"),
    ("GET", "/api/participant/account"),
    ("PATCH", "/api/participant/account"),
    ("PATCH", "/api/participant/account/password"),
}


class RouteContractTests(unittest.TestCase):
    def test_frontend_contracts_are_preserved(self):
        schema = app.openapi()
        actual = {
            (method.upper(), path)
            for path, operations in schema["paths"].items()
            for method in operations
            if method in {"get", "post", "patch", "put", "delete"}
        }
        self.assertTrue(EXPECTED_ROUTES.issubset(actual))


if __name__ == "__main__":
    unittest.main()
