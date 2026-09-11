from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentOut(BaseModel):
    id: int
    doc_type: str
    filename: str
    uploaded_at: datetime
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatMessageInput(BaseModel):
    message: str
    vault_user_id: Optional[int] = None # Optional target vault for family sharing

class CitationOut(BaseModel):
    doc_id: int
    filename: str
    snippet: str

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[List[CitationOut]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Subscription Schemas ---
class SubscriptionCreate(BaseModel):
    name: str
    monthly_cost: float
    last_price: Optional[float] = None
    renewal_date: Optional[str] = None
    cancel_difficulty_score: Optional[int] = 1

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    monthly_cost: Optional[float] = None
    last_price: Optional[float] = None
    renewal_date: Optional[str] = None
    cancel_difficulty_score: Optional[int] = None
    status: Optional[str] = None

class SubscriptionOut(BaseModel):
    id: int
    name: str
    monthly_cost: float
    last_price: Optional[float] = None
    renewal_date: Optional[str] = None
    cancel_difficulty_score: int
    status: str

    class Config:
        from_attributes = True

# --- Reminder Schemas ---
class ReminderOut(BaseModel):
    id: int
    title: str
    due_date: str
    source_document_id: Optional[int] = None
    status: str

    class Config:
        from_attributes = True

# --- Agent Action Schemas ---
class AgentActionOut(BaseModel):
    id: int
    action_type: str
    reasoning: Optional[str] = None
    payload_json: Dict[str, Any]
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Family Shared Vault Schemas ---
class FamilyInvite(BaseModel):
    email: EmailStr
    permission_level: str = "read" # read | manage

class FamilyLinkOut(BaseModel):
    id: int
    owner_user_id: int
    owner_name: str
    owner_email: str
    permission_level: str
    created_at: datetime
