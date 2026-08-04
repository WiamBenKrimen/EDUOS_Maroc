import json
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi import HTTPException
from pydantic import ValidationError

from eduos.modules.assistant.schemas import AssistantChatInput
from eduos.modules.assistant.service import (
    ACTION_MODELS,
    READ_TOOL_NAMES,
    EnrollmentActionInput,
    _clean_reply,
    _direct_overview_request,
    _direct_people_search,
    _direct_whatsapp_request,
    _execute_read_tool,
    _format_overview_result,
    _format_people_result,
    _rank_records,
    _referenced_ids,
    _sanitize_rich_reply,
    _search_result,
    _validate_action_targets,
    chat,
)


class AssistantTests(unittest.TestCase):
    def test_reasoning_is_not_exposed(self):
        response = _clean_reply(
            "<think>raisonnement privé</think>Voici la réponse utile."
        )
        self.assertEqual("Voici la réponse utile.", response)

    def test_reply_normalizes_long_dashes(self):
        self.assertEqual("Priorité - paiement", _clean_reply("Priorité — paiement"))

    def test_enrollment_requires_business_identifiers(self):
        with self.assertRaises(ValidationError):
            EnrollmentActionInput.model_validate(
                {
                    "prenom": "Salma",
                    "nom": "Amrani",
                    "email": "salma@example.ma",
                }
            )

    def test_supported_actions_are_explicit(self):
        self.assertEqual(
            {
                "prepare_enrollment",
                "prepare_prospect",
                "prepare_personnel",
                "prepare_formation",
                "prepare_cohort",
                "prepare_session",
                "prepare_payment",
                "prepare_prospect_status",
                "prepare_renewal_update",
                "prepare_cohort_update",
                "prepare_session_update",
                "prepare_session_delete",
                "prepare_change_request_decision",
                "prepare_attestations",
                "prepare_overdue_reminders",
                "prepare_remuneration_status",
                "prepare_whatsapp_message",
                "prepare_reminder_rule_update",
            },
            set(ACTION_MODELS),
        )

    def test_search_normalizes_accents_and_typing_variants(self):
        records = [
            {"nom_complet": "Youssef El Amrâni", "email": "youssef@eduos.ma"},
            {"nom_complet": "Salma Idrissi", "email": "salma@eduos.ma"},
        ]
        matches, scores = _rank_records(
            "yousef el amrani",
            records,
            ("nom_complet", "email"),
            6,
        )
        self.assertEqual("Youssef El Amrâni", matches[0]["nom_complet"])
        self.assertGreaterEqual(scores[0], 42)

    def test_homonyms_require_a_readable_choice(self):
        items = [
            {"nom_complet": "Sara Amrani", "email": "sara1@eduos.ma"},
            {"nom_complet": "Sara Amrani", "email": "sara2@eduos.ma"},
        ]
        matches, scores = _rank_records("Sara Amrani", items, ("nom_complet",), 6)
        result = _search_result(matches, scores)
        self.assertEqual("multiple", result["resolution"])

    def test_read_tools_cover_business_identifiers(self):
        self.assertEqual(
            {
                "get_center_overview",
                "search_people",
                "search_cohorts",
                "search_formations",
                "search_invoices",
                "search_sessions",
                "search_reports",
                "search_renewals",
                "search_attestations",
                "search_change_requests",
                "list_reminder_rules",
                "search_remunerations",
                "search_whatsapp_contacts",
            },
            READ_TOOL_NAMES,
        )

    def test_plural_action_identifiers_are_checked(self):
        first = str(uuid4())
        second = str(uuid4())
        self.assertEqual(
            {first, second},
            _referenced_ids({"inscription_ids": [first, second]}),
        )

    def test_direct_people_search_asks_for_missing_name(self):
        self.assertEqual(
            ("participant", "__missing_query__"),
            _direct_people_search("Trouve un apprenant par son nom"),
        )

    def test_overview_requests_are_recognized(self):
        self.assertTrue(_direct_overview_request("Fais-moi le briefing du centre"))
        self.assertTrue(_direct_overview_request("Résume la situation du centre"))
        self.assertFalse(_direct_overview_request("Trouve la situation de Salma"))

    def test_whatsapp_send_request_extracts_contact_and_message(self):
        self.assertEqual(
            ("Salma Idrissi", "le cours est reporté à 15 h"),
            _direct_whatsapp_request(
                "Envoie un message WhatsApp à Salma Idrissi pour lui dire que "
                "le cours est reporté à 15 h"
            ),
        )

    def test_whatsapp_send_request_without_text_is_still_recognized(self):
        self.assertEqual(
            ("Salma Idrissi", ""),
            _direct_whatsapp_request("Envoie un WhatsApp à Salma Idrissi"),
        )

    def test_overview_reply_is_decision_oriented_without_internal_tools(self):
        reply = _format_overview_result(
            {
                "indicateurs": {
                    "active_students": 9,
                    "attendance_rate": 80,
                    "collected_revenue": 450,
                    "invoices_to_follow": 1,
                },
                "prochaines_seances": [],
            }
        )
        self.assertIn("## Briefing du centre", reply)
        self.assertIn("Traiter la facture", reply)
        self.assertNotIn("outil", reply.lower())

    def test_direct_people_search_extracts_name(self):
        self.assertEqual(
            ("participant", "Salma Idrissi"),
            _direct_people_search("Trouve l'apprenant Salma Idrissi"),
        )

    def test_direct_people_result_never_exposes_ids(self):
        hidden_id = str(uuid4())
        reply = _format_people_result(
            {
                "resolution": "unique",
                "results": [
                    {
                        "id": hidden_id,
                        "type": "participant",
                        "nom_complet": "Salma Idrissi",
                        "email": "salma@eduos.ma",
                        "reference": "EDU-014",
                        "statut": "actif",
                    }
                ],
            },
            "Salma Idrissi",
        )
        self.assertIn("Salma Idrissi", reply)
        self.assertNotIn(hidden_id, reply)

    def test_only_images_returned_by_tools_are_kept(self):
        allowed = "https://cdn.eduos.ma/avatar/sara.jpg"
        content = (
            f"![Sara]({allowed})\n![Image inventée](https://example.test/fake.jpg)"
        )
        result = _sanitize_rich_reply(content, {allowed})
        self.assertIn(f"![Sara]({allowed})", result)
        self.assertNotIn("https://example.test/fake.jpg", result)


class AssistantAgentLoopTests(unittest.IsolatedAsyncioTestCase):
    async def test_whatsapp_send_is_prepared_and_never_claimed_as_sent(self):
        contact_id = uuid4()
        pool = object()
        user = {"centre_id": uuid4(), "id": uuid4()}
        payload = AssistantChatInput(
            message=(
                "Envoie un message WhatsApp à Salma Idrissi pour lui dire que "
                "le cours est reporté à 15 h"
            )
        )
        pending = {
            "id": str(uuid4()),
            "action": "prepare_whatsapp_message",
            "title": "Envoyer un message WhatsApp",
            "description": "Message préparé",
            "details": [],
            "expires_at": "2026-08-04T15:00:00+02:00",
        }

        with (
            patch(
                "eduos.modules.assistant.service._execute_read_tool",
                new=AsyncMock(
                    return_value={
                        "resolution": "unique",
                        "results": [
                            {
                                "id": str(contact_id),
                                "nom": "Salma Idrissi",
                                "telephone": "+212612345678",
                            }
                        ],
                    }
                ),
            ) as search_contact,
            patch(
                "eduos.modules.assistant.service.prepare_action",
                new=AsyncMock(return_value=pending),
            ) as prepare,
            patch(
                "eduos.modules.assistant.service.run_in_threadpool",
                new=AsyncMock(),
            ) as run_model,
        ):
            result = await chat(pool, user, payload)

        search_contact.assert_awaited_once_with(
            pool,
            user["centre_id"],
            "search_whatsapp_contacts",
            {"query": "Salma Idrissi", "limit": 6},
        )
        prepare.assert_awaited_once_with(
            pool,
            user,
            "prepare_whatsapp_message",
            {"recipient_id": str(contact_id), "message": "le cours est reporté à 15 h"},
        )
        run_model.assert_not_awaited()
        self.assertIs(pending, result["pending_action"])
        self.assertIn("confirmez", result["reply"].lower())
        self.assertNotIn("envoyé", result["reply"].lower())

    async def test_people_search_resolves_phone_without_exposing_user_input_ids(self):
        participant_id = uuid4()
        records = [
            {
                "type": "participant",
                "id": participant_id,
                "user_id": uuid4(),
                "intervenant_id": None,
                "nom_complet": "Sara Amrani",
                "email": "sara@eduos.ma",
                "telephone": "+212 6 12 34 56 78",
                "reference": "EDU-2026-014",
                "fonction": None,
                "avatar_url": None,
                "statut": "actif",
            }
        ]
        with patch(
            "eduos.modules.assistant.service.repository.list_people_catalog",
            new=AsyncMock(return_value=records),
        ):
            result = await _execute_read_tool(
                object(),
                uuid4(),
                "search_people",
                {"query": "0612345678", "type": "participant"},
            )

        self.assertEqual("unique", result["resolution"])
        self.assertEqual(str(participant_id), result["results"][0]["id"])

    async def test_unknown_business_identifier_is_rejected(self):
        with patch(
            "eduos.modules.assistant.service.inscriptions_repository.list_options",
            new=AsyncMock(return_value=[]),
        ):
            with self.assertRaises(HTTPException) as raised:
                await _validate_action_targets(
                    object(),
                    uuid4(),
                    "prepare_enrollment",
                    {"cohorte_id": str(uuid4())},
                )
        self.assertEqual(422, raised.exception.status_code)

    async def test_agent_observes_search_result_before_replying(self):
        tool_call = {
            "id": "call-people",
            "type": "function",
            "function": {
                "name": "search_people",
                "arguments": '{"query":"Sara","type":"participant"}',
            },
        }
        settings = SimpleNamespace(
            nvidia_api_key="secret",
            nvidia_api_url="https://example.test/v1",
            nvidia_ai_model="test-model",
        )
        responses = [
            {"content": None, "tool_calls": [tool_call]},
            {"content": "| Nom | E-mail |\n|---|---|\n| Sara | sara@eduos.ma |"},
        ]
        user = {"centre_id": uuid4(), "id": uuid4()}
        payload = AssistantChatInput(message="Trouve Sara")

        with (
            patch(
                "eduos.modules.assistant.service.get_settings", return_value=settings
            ),
            patch(
                "eduos.modules.assistant.service._business_context",
                new=AsyncMock(return_value={"indicateurs": {}}),
            ),
            patch(
                "eduos.modules.assistant.service._execute_read_tool",
                new=AsyncMock(
                    return_value={
                        "resolution": "unique",
                        "results": [{"nom_complet": "Sara"}],
                    }
                ),
            ) as execute_search,
            patch(
                "eduos.modules.assistant.service.run_in_threadpool",
                new=AsyncMock(side_effect=responses),
            ) as run_model,
        ):
            result = await chat(object(), user, payload)

        self.assertEqual(2, run_model.await_count)
        execute_search.assert_awaited_once()
        self.assertIn("| Sara |", result["reply"])
        self.assertIsNone(result["pending_action"])

    async def test_action_identifier_must_come_from_a_search_tool(self):
        cohort_id = uuid4()
        direct_action = {
            "id": "call-session",
            "type": "function",
            "function": {
                "name": "prepare_session",
                "arguments": json.dumps(
                    {
                        "cohorte_id": str(cohort_id),
                        "titre": "Python",
                        "starts_at": "2026-08-04T10:00:00+02:00",
                        "ends_at": "2026-08-04T12:00:00+02:00",
                    }
                ),
            },
        }
        settings = SimpleNamespace(
            nvidia_api_key="secret",
            nvidia_api_url="https://example.test/v1",
            nvidia_ai_model="test-model",
        )
        user = {"centre_id": uuid4(), "id": uuid4()}
        with (
            patch(
                "eduos.modules.assistant.service.get_settings", return_value=settings
            ),
            patch(
                "eduos.modules.assistant.service._business_context",
                new=AsyncMock(return_value={"indicateurs": {}}),
            ),
            patch(
                "eduos.modules.assistant.service.prepare_action",
                new=AsyncMock(),
            ) as prepare,
            patch(
                "eduos.modules.assistant.service.run_in_threadpool",
                new=AsyncMock(
                    side_effect=[
                        {"content": None, "tool_calls": [direct_action]},
                        {"content": "Je dois d'abord rechercher la cohorte."},
                    ]
                ),
            ),
        ):
            result = await chat(
                object(), user, AssistantChatInput(message="Planifie la séance")
            )

        prepare.assert_not_awaited()
        self.assertIn("rechercher", result["reply"])


if __name__ == "__main__":
    unittest.main()
