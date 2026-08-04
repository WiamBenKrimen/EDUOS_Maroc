import pytest
from fastapi.testclient import TestClient

from eduos.main import app

pytestmark = pytest.mark.integration


def test_api_and_database_health() -> None:
    with TestClient(app) as client:
        api_response = client.get("/api/health")
        database_response = client.get("/api/health/db")

    assert api_response.status_code == 200
    assert api_response.json()["status"] == "ok"
    assert database_response.status_code == 200
    assert database_response.json()["database"] == "postgresql"
