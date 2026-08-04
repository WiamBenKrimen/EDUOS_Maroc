import unittest
from urllib.parse import parse_qs, urlparse

from eduos.integrations.storage.google_drive import DRIVE_FILE_SCOPE
from eduos.integrations.storage.google_oauth import authorization_url


class GoogleDriveOAuthTests(unittest.TestCase):
    def test_authorization_requests_offline_limited_drive_access(self):
        url = authorization_url(
            "client-123",
            "http://localhost:3001/callback",
            "signed-state",
        )
        query = parse_qs(urlparse(url).query)
        self.assertEqual(["code"], query["response_type"])
        self.assertEqual(["offline"], query["access_type"])
        self.assertEqual(["signed-state"], query["state"])
        self.assertIn(DRIVE_FILE_SCOPE, query["scope"][0].split())
        self.assertNotIn(
            "https://www.googleapis.com/auth/drive",
            query["scope"][0].split(),
        )
