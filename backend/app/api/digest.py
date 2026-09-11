from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User
from app.agent.digest import generate_weekly_life_digest

router = APIRouter(prefix="/digest", tags=["digest"])

@router.get("/latest")
async def get_latest_digest(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    digest_text = await generate_weekly_life_digest(db, current_user.id)
    return {"digest": digest_text}

@router.post("/generate")
async def trigger_digest_generation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    digest_text = await generate_weekly_life_digest(db, current_user.id)
    return {"digest": digest_text}
