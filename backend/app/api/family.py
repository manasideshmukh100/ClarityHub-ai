from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, FamilyLink, Document
from app.schemas.schemas import FamilyInvite, FamilyLinkOut, DocumentOut

router = APIRouter(prefix="/family", tags=["family"])

@router.post("/invite")
def invite_family_member(
    payload: FamilyInvite,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.email == payload.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="No user found with that email address. Ask them to register first.")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot share your vault with yourself.")

    existing = db.query(FamilyLink).filter(
        FamilyLink.owner_user_id == current_user.id,
        FamilyLink.member_user_id == target_user.id
    ).first()

    if existing:
        return {"message": "Vault access already granted to this family member.", "link_id": existing.id}

    link = FamilyLink(
        owner_user_id=current_user.id,
        member_user_id=target_user.id,
        permission_level=payload.permission_level
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return {"message": f"Successfully granted {payload.permission_level} access to {target_user.name}.", "link_id": link.id}

@router.get("/vaults", response_model=List[FamilyLinkOut])
def get_accessible_vaults(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    links = db.query(FamilyLink).filter(FamilyLink.member_user_id == current_user.id).all()
    out = []
    for link in links:
        owner = db.query(User).filter(User.id == link.owner_user_id).first()
        if owner:
            out.append(FamilyLinkOut(
                id=link.id,
                owner_user_id=owner.id,
                owner_name=owner.name,
                owner_email=owner.email,
                permission_level=link.permission_level,
                created_at=link.created_at
            ))
    return out

@router.get("/vaults/{owner_id}/documents", response_model=List[DocumentOut])
def get_shared_vault_documents(
    owner_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify explicit family permission
    link = db.query(FamilyLink).filter(
        FamilyLink.owner_user_id == owner_id,
        FamilyLink.member_user_id == current_user.id
    ).first()

    if not link:
        raise HTTPException(status_code=403, detail="You do not have access permission for this family vault.")

    return db.query(Document).filter(Document.user_id == owner_id).all()
