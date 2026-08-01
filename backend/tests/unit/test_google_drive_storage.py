import unittest
from email.message import Message
from io import BytesIO

from eduos.integrations.storage.google_drive import (
    DriveNotConfiguredError,
    GoogleDriveStorage,
    drive_file_id,
    drive_storage_key,
)


class GoogleDriveStorageTests(unittest.TestCase):
    def test_storage_key_round_trip(self):
        key = drive_storage_key("drive-file-123")
        self.assertEqual("gdrive:drive-file-123", key)
        self.assertEqual("drive-file-123", drive_file_id(key))

    def test_non_drive_key_is_not_accepted(self):
        self.assertIsNone(drive_file_id(None))
        self.assertIsNone(drive_file_id("https://example.test/file.pdf"))
        self.assertIsNone(drive_file_id("gdrive:   "))

    def test_missing_configuration_fails_cleanly(self):
        storage = GoogleDriveStorage(None, None)
        with self.assertRaises(DriveNotConfiguredError):
            storage.download("drive-file-123")

    def test_upload_builds_private_drive_file_metadata(self):
        class RecordingStorage(GoogleDriveStorage):
            recorded_body = b""

            def _request(self, url, method="GET", body=None, content_type=None):
                self.recorded_body = body or b""
                return (
                    b'{"id":"file-1","name":"cours.pdf",'
                    b'"mimeType":"application/pdf","size":"7"}',
                    {},
                )

        storage = RecordingStorage("credentials.json", "shared-folder")
        result = storage.upload(
            BytesIO(b"PDFDATA"),
            "cours.pdf",
            "application/pdf",
            "cohort-123",
        )
        self.assertEqual("file-1", result.file_id)
        self.assertIn(b'"parents": ["shared-folder"]', storage.recorded_body)
        self.assertIn(b'"eduos_cohort_id": "cohort-123"', storage.recorded_body)
        self.assertIn(b"PDFDATA", storage.recorded_body)

    def test_thumbnail_uses_drive_preview_in_card_size(self):
        class RecordingStorage(GoogleDriveStorage):
            requested_urls = []

            def _request(self, url, **_kwargs):
                self.requested_urls.append(url)
                headers = Message()
                if "thumbnailLink" in url:
                    return b'{"thumbnailLink":"https://preview.test/file=s220"}', headers
                headers["Content-Type"] = "image/jpeg"
                return b"THUMBNAIL", headers

        storage = RecordingStorage("credentials.json", "shared-folder")
        result = storage.thumbnail("drive-file-123")

        self.assertIsNotNone(result)
        assert result is not None
        self.assertEqual(b"THUMBNAIL", result.content)
        self.assertEqual("image/jpeg", result.mime_type)
        self.assertEqual("https://preview.test/file=w1200", storage.requested_urls[-1])


if __name__ == "__main__":
    unittest.main()
