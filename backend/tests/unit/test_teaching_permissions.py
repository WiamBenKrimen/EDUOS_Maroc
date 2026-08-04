import asyncio
import unittest

from fastapi import HTTPException

from eduos.api.dependencies import teacher_required, teaching_staff_required


class TeachingPermissionTests(unittest.TestCase):
    def test_formateur_and_enseignant_access_teaching_space(self):
        for fonction in ("formateur", "enseignant"):
            user = {
                "role": "personnel",
                "personnel_fonction": fonction,
                "centre_id": "centre",
            }
            self.assertIs(
                user,
                asyncio.run(teaching_staff_required(user)),  # type: ignore[arg-type]
            )

    def test_other_personnel_function_is_rejected(self):
        user = {
            "role": "personnel",
            "personnel_fonction": "commercial",
            "centre_id": "centre",
        }
        with self.assertRaises(HTTPException) as raised:
            asyncio.run(teaching_staff_required(user))  # type: ignore[arg-type]
        self.assertEqual(403, raised.exception.status_code)

    def test_grades_are_restricted_to_teachers(self):
        formateur = {
            "role": "personnel",
            "personnel_fonction": "formateur",
            "centre_id": "centre",
        }
        with self.assertRaises(HTTPException) as raised:
            asyncio.run(teacher_required(formateur))  # type: ignore[arg-type]
        self.assertEqual(403, raised.exception.status_code)


if __name__ == "__main__":
    unittest.main()
