import asyncio
import unittest
from uuid import uuid4

from eduos.modules.inscriptions import repository


class RecordingConnection:
    def __init__(self) -> None:
        self.query = ""
        self.arguments: tuple[object, ...] = ()

    async def execute(self, query: str, *arguments: object) -> None:
        self.query = query
        self.arguments = arguments


class InscriptionsRepositoryTests(unittest.TestCase):
    def test_contract_storage_key_keeps_enrollment_parameter_as_uuid(self):
        connection = RecordingConnection()
        centre_id = uuid4()
        participant_id = uuid4()
        enrollment_id = uuid4()
        created_by = uuid4()

        asyncio.run(
            repository.create_contract_record(
                connection,  # type: ignore[arg-type]
                centre_id,
                participant_id,
                enrollment_id,
                created_by,
                "Test Participant",
            )
        )

        self.assertIn("$3::uuid::text", connection.query)
        self.assertEqual(enrollment_id, connection.arguments[2])


if __name__ == "__main__":
    unittest.main()
