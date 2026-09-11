from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import Document, DocumentChunk
from app.rag.embedder import get_text_embedding, cosine_similarity

def search_relevant_chunks(
    db: Session,
    user_ids: List[int],
    query: str,
    top_k: int = 4,
    threshold: float = 0.15
) -> List[Tuple[DocumentChunk, Document, float]]:
    """
    Searches document_chunks for given user_ids matching the query.
    Returns list of (Chunk, Document, similarity_score).
    """
    query_vec = get_text_embedding(query)
    
    # Query all chunks belonging to allowed documents
    chunks_query = (
        db.query(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
        .filter(Document.user_id.in_(user_ids))
        .all()
    )

    scored_chunks = []
    for chunk, doc in chunks_query:
        if not chunk.embedding_json:
            continue
        score = cosine_similarity(query_vec, chunk.embedding_json)
        if score >= threshold:
            scored_chunks.append((chunk, doc, score))

    # Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x[2], reverse=True)
    return scored_chunks[:top_k]
