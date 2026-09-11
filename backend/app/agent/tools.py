import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import AgentAction, Reminder, Subscription

def tool_draft_email(db: Session, user_id: int, to_email: str, subject: str, body: str, reasoning: str) -> AgentAction:
    action = AgentAction(
        user_id=user_id,
        action_type="email_draft",
        reasoning=reasoning,
        payload_json={
            "to": to_email,
            "subject": subject,
            "body": body
        },
        status="pending_approval"
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

def tool_create_reminder(db: Session, user_id: int, title: str, due_date: str, reasoning: str, source_doc_id: int = None) -> Reminder:
    reminder = Reminder(
        user_id=user_id,
        title=title,
        due_date=due_date,
        source_document_id=source_doc_id,
        status="pending"
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

def tool_flag_dark_pattern(db: Session, subscription_id: int, evidence: str) -> None:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if sub:
        sub.cancel_difficulty_score = 5
        db.commit()
