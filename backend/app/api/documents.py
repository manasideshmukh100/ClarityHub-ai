import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User, Document, DocumentChunk
from app.schemas.schemas import DocumentOut
from app.rag.extractor import extract_text_from_file
from app.rag.chunker import chunk_text
from app.rag.embedder import get_text_embedding
from app.core.llm import llm_adapter

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("other"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save file to disk
    safe_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text content
    extracted = extract_text_from_file(file_path)

    # Generate document summary using LLM
    summary_prompt = f"Provide a 2-sentence executive summary of the following document content:\n{extracted[:2000]}"
    try:
        summary = await llm_adapter.generate_response(
            system_prompt="You are ClarityHub AI document summarizer.",
            user_prompt=summary_prompt
        )
    except Exception:
        summary = extracted[:200] + "..." if len(extracted) > 200 else extracted

    # Create Document DB entry
    doc = Document(
        user_id=current_user.id,
        doc_type=doc_type,
        filename=file.filename,
        storage_path=file_path,
        extracted_text=extracted,
        summary=summary,
        metadata_json={"file_size": os.path.getsize(file_path)}
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Chunk text & generate embeddings
    chunks = chunk_text(extracted, chunk_size=500, overlap=50)
    for idx, chunk_str in enumerate(chunks):
        vec = get_text_embedding(chunk_str)
        doc_chunk = DocumentChunk(
            document_id=doc.id,
            chunk_text=chunk_str,
            embedding_json=vec,
            chunk_index=idx
        )
        db.add(doc_chunk)

    db.commit()
    return doc

@router.get("", response_model=List[DocumentOut])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc()).all()

@router.get("/{id}", response_model=DocumentOut)
def get_document(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{id}")
def delete_document(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.storage_path):
        try:
            os.remove(doc.storage_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"status": "deleted", "id": id}
