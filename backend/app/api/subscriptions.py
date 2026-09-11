from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Subscription
from app.schemas.schemas import SubscriptionCreate, SubscriptionUpdate, SubscriptionOut

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("", response_model=List[SubscriptionOut])
def list_subscriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Subscription).filter(Subscription.user_id == current_user.id).all()

@router.post("", response_model=SubscriptionOut)
def create_subscription(
    payload: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = Subscription(
        user_id=current_user.id,
        name=payload.name,
        monthly_cost=payload.monthly_cost,
        last_price=payload.last_price or payload.monthly_cost,
        renewal_date=payload.renewal_date,
        cancel_difficulty_score=payload.cancel_difficulty_score or 1,
        status="active"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.patch("/{id}", response_model=SubscriptionOut)
def update_subscription(
    id: int,
    payload: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(Subscription.id == id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if payload.name is not None:
        sub.name = payload.name
    if payload.monthly_cost is not None:
        sub.monthly_cost = payload.monthly_cost
    if payload.last_price is not None:
        sub.last_price = payload.last_price
    if payload.renewal_date is not None:
        sub.renewal_date = payload.renewal_date
    if payload.cancel_difficulty_score is not None:
        sub.cancel_difficulty_score = payload.cancel_difficulty_score
    if payload.status is not None:
        sub.status = payload.status

    db.commit()
    db.refresh(sub)
    return sub

@router.delete("/{id}")
def delete_subscription(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.id == id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"status": "deleted", "id": id}
