from sqlalchemy.orm import Session
from app.models.models import Subscription, Reminder, Document, AgentAction
from app.core.llm import llm_adapter

async def generate_weekly_life_digest(db: Session, user_id: int) -> str:
    subs = db.query(Subscription).filter(Subscription.user_id == user_id).all()
    reminders = db.query(Reminder).filter(Reminder.user_id == user_id, Reminder.status == "pending").all()
    documents = db.query(Document).filter(Document.user_id == user_id).all()
    pending_actions = db.query(AgentAction).filter(AgentAction.user_id == user_id, AgentAction.status == "pending_approval").all()

    total_monthly = sum(s.monthly_cost for s in subs)
    annual_spend = total_monthly * 12

    context_summary = f"""
    User Life Admin Overview:
    - Active Subscriptions ({len(subs)}): {', '.join([f'{s.name} (${s.monthly_cost}/mo)' for s in subs])}
    - Total Monthly Spend: ${total_monthly:.2f} (Annualized: ${annual_spend:.2f})
    - Pending Reminders ({len(reminders)}): {', '.join([r.title for r in reminders])}
    - Total Vault Documents: {len(documents)}
    - Pending Agent Actions Requiring Approval: {len(pending_actions)}
    """

    system_prompt = "You are ClarityHub AI, producing a weekly Life Digest summary for a user. Be clear, legibly structured, supportive, and actionable."
    user_prompt = f"Generate a weekly Life Digest summary based on the following account context:\n{context_summary}"

    return await llm_adapter.generate_response(system_prompt, user_prompt)
