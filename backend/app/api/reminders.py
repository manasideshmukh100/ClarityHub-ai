from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Reminder
from app.schemas.schemas import ReminderOut

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.get("", response_model=List[ReminderOut])
def list_reminders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Reminder).filter(Reminder.user_id == current_user.id).order_by(Reminder.status.desc()).all()

@router.post("/{id}/complete", response_model=ReminderOut)
def complete_reminder(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == id, Reminder.user_id == current_user.id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    rem.status = "completed"
    db.commit()
    db.refresh(rem)
    return rem
