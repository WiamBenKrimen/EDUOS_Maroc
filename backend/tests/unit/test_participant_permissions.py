import asyncio
import unittest

from fastapi import HTTPException

from eduos.api.dependencies import participant_required


class ParticipantPermissionTests(unittest.TestCase):
    def test_participant_can_access_participant_space(self):
        user = {
            "role": "participant",
            "personnel_fonction": None,
            "centre_id": "centre",
        }
        self.assertIs(
            user,
            asyncio.run(participant_required(user)),  # type: ignore[arg-type]
        )

    def test_other_roles_are_rejected(self):
        for role in ("directeur", "personnel", "administrateur"):
            user = {
                "role": role,
                "personnel_fonction": "formateur",
                "centre_id": "centre",
            }
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(participant_required(user))  # type: ignore[arg-type]
            self.assertEqual(403, raised.exception.status_code)

    def test_participant_without_centre_is_rejected(self):
        user = {
            "role": "participant",
            "personnel_fonction": None,
            "centre_id": None,
        }
        with self.assertRaises(HTTPException) as raised:
            asyncio.run(participant_required(user))  # type: ignore[arg-type]
        self.assertEqual(403, raised.exception.status_code)


if __name__ == "__main__":
    unittest.main()
