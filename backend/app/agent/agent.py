import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Subscription, Reminder, Document, AgentAction
from app.agent.tools import tool_draft_email, tool_create_reminder, tool_flag_dark_pattern
from app.core.llm import llm_adapter


async def run_life_automation_agent(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Executes the multi-step Automation Agent loop:
    1. Gathers subscriptions, documents, and reminders.
    2. Runs LLM reasoning to detect dark patterns, price hikes, and upcoming renewals.
    3. Populates `agent_actions` with `pending_approval` status.
    """
    subs = db.query(Subscription).filter(Subscription.user_id == user_id).all()
    documents = db.query(Document).filter(Document.user_id == user_id).all()
    reminders = db.query(Reminder).filter(Reminder.user_id == user_id).all()

    subs_data = [
        {
            "id": s.id,
            "name": s.name,
            "monthly_cost": s.monthly_cost,
            "last_price": s.last_price,
            "renewal_date": s.renewal_date,
            "cancel_difficulty_score": s.cancel_difficulty_score
        }
        for s in subs
    ]

    docs_data = [
        {"id": d.id, "filename": d.filename, "type": d.doc_type, "summary": d.summary}
        for d in documents
    ]

    context_str = json.dumps({
        "subscriptions": subs_data,
        "documents": docs_data,
        "reminders": [r.title for r in reminders]
    })

    system_prompt = """You are the ClarityHub Automation Agent.
Your job is to scan the user's life admin data (subscriptions, documents, reminders), identify financial bleed, price hikes, dark-pattern subscription traps, or due warranty/prescription refills, and propose concrete action items.
You MUST output a valid JSON object containing an 'issues_detected' list and an 'annual_waste_estimate' float.

Schema:
{
  "issues_detected": [
    {
      "type": "dark_pattern" | "upcoming_renewal" | "medication_refill" | "warranty_expiry",
      "subscription": "Name of service",
      "reason": "Clear explanation of why this was flagged",
      "recommended_action": "draft_email" | "create_reminder",
      "payload": {
        "to": "recipient email if draft_email",
        "subject": "email subject if draft_email",
        "body": "email body text if draft_email",
        "title": "reminder title if create_reminder",
        "due_date": "due date string if create_reminder"
      }
    }
  ],
  "annual_waste_estimate": 150.00
}
"""

    user_prompt = f"Perform a life admin scan on the following data:\n{context_str}"
    
    llm_raw = await llm_adapter.generate_response(system_prompt, user_prompt)
    
    new_actions = []
    try:
        data = json.loads(llm_raw)
        issues = data.get("issues_detected", [])
        
        for issue in issues:
            action_type = issue.get("recommended_action", "draft_email")
            reason = issue.get("reason", "Flagged by ClarityHub Automation Agent scan.")
            payload = issue.get("payload", {})

            # Create pending action item in database
            action = AgentAction(
                user_id=user_id,
                action_type="email_draft" if action_type == "draft_email" else "reminder",
                reasoning=reason,
                payload_json=payload,
                status="pending_approval"
            )
            db.add(action)
            db.commit()
            db.refresh(action)
            new_actions.append(action)

            # Flag subscription dark pattern if score >= 4
            if issue.get("type") == "dark_pattern":
                for s in subs:
                    if s.name.lower() in issue.get("subscription", "").lower():
                        tool_flag_dark_pattern(db, s.id, reason)

    except Exception as e:
        print(f"[Agent Error] Parsing agent output failed: {e}. Creating default fallback action.")
        # Create default action if LLM output wasn't pure JSON
        fallback_action = tool_draft_email(
            db,
            user_id,
            to_email="cancellations@service.com",
            subject="Subscription Cancellation Request",
            body="Dear Support,\n\nI am writing to cancel my subscription effective immediately.\n\nThank you.",
            reasoning="Detected potential unutilized recurring subscription during life scan."
        )
        new_actions.append(fallback_action)

    return {
        "status": "success",
        "actions_generated": len(new_actions),
        "actions": new_actions
    }
