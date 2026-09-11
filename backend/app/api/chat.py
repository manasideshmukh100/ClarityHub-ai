from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, ChatMessage, FamilyLink
from app.schemas.schemas import ChatMessageInput, ChatMessageOut, CitationOut
from app.rag.vector_store import search_relevant_chunks
from app.core.llm import llm_adapter

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatMessageOut)
async def chat(
    payload: ChatMessageInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    db.commit()

    # Determine allowed user IDs for document retrieval (current user + shared family vaults)
    allowed_user_ids = [current_user.id]
    family_links = db.query(FamilyLink).filter(FamilyLink.member_user_id == current_user.id).all()
    for link in family_links:
        allowed_user_ids.append(link.owner_user_id)

    # Perform RAG vector similarity search
    results = search_relevant_chunks(db, allowed_user_ids, payload.message, top_k=3, threshold=0.10)

    citations = []
    context_blocks = []

    if results:
        for chunk, doc, score in results:
            citations.append({
                "doc_id": doc.id,
                "filename": doc.filename,
                "snippet": chunk.chunk_text[:150] + "..."
            })
            context_blocks.append(f"--- Document: '{doc.filename}' (Type: {doc.doc_type}) ---\n{chunk.chunk_text}")

        context_str = "\n\n".join(context_blocks)
        system_prompt = f"""You are ClarityHub AI, a personal life-admin assistant.
Answer the user's question accurately using ONLY the provided document excerpts below.
Always cite the source document name explicitly when stating facts.
If the documents do not contain the answer, explicitly state: 'Your document vault does not contain information to answer this question.' Do NOT hallucinate.

Excerpts from Document Vault:
{context_str}
"""
    else:
        system_prompt = """You are ClarityHub AI, a helpful life-admin assistant.
The user asked a question, but their document vault contains no relevant documents matching this query.
Inform the user politely that their document vault does not contain information about this topic, and offer general advice if appropriate without inventing facts about their specific accounts."""

    answer_text = await llm_adapter.generate_response(system_prompt, payload.message)

    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=answer_text,
        citations_json=citations
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageOut(
        id=assistant_msg.id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        citations=[CitationOut(**c) for c in citations] if citations else [],
        created_at=assistant_msg.created_at
    )

@router.get("/history", response_model=List[ChatMessageOut])
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()
    out = []
    for m in messages:
        citations = [CitationOut(**c) for c in m.citations_json] if m.citations_json else []
        out.append(ChatMessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            citations=citations,
            created_at=m.created_at
        ))
    return out
