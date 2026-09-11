import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, AgentAction, Reminder
from app.schemas.schemas import AgentActionOut
from app.agent.agent import run_life_automation_agent

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/scan")
async def trigger_agent_scan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = await run_life_automation_agent(db, current_user.id)
    return result

@router.get("/actions", response_model=List[AgentActionOut])
def list_agent_actions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(AgentAction).filter(AgentAction.user_id == current_user.id).order_by(AgentAction.created_at.desc()).all()

@router.post("/actions/{id}/approve", response_model=AgentActionOut)
def approve_action(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    action = db.query(AgentAction).filter(AgentAction.id == id, AgentAction.user_id == current_user.id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Agent action not found")

    action.status = "approved"
    action.resolved_at = datetime.datetime.utcnow()

    # If action is creating a reminder, populate the Reminder table
    if action.action_type == "reminder":
        payload = action.payload_json or {}
        rem = Reminder(
            user_id=current_user.id,
            title=payload.get("title", "Agent Action Reminder"),
            due_date=payload.get("due_date", "Soon"),
            status="pending"
        )
        db.add(rem)

    db.commit()
    db.refresh(action)
    return action

@router.post("/actions/{id}/reject", response_model=AgentActionOut)
def reject_action(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    action = db.query(AgentAction).filter(AgentAction.id == id, AgentAction.user_id == current_user.id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Agent action not found")

    action.status = "rejected"
    action.resolved_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(action)
    return action
