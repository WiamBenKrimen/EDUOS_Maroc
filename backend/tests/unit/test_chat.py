from uuid import uuid4

from eduos.modules.chat.schemas import MessageInput


def test_message_input_valid():
    recipient_id = uuid4()
    msg = MessageInput(recipient_id=recipient_id, body="Bonjour, comment allez-vous ?")
    assert msg.recipient_id == recipient_id
    assert msg.body == "Bonjour, comment allez-vous ?"


def test_message_input_whitespace_trimmed():
    recipient_id = uuid4()
    msg = MessageInput(recipient_id=recipient_id, body="  Message de test  ")
    assert msg.body == "  Message de test  "
