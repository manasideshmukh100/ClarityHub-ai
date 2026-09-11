from typing import List

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Splits text into chunks of roughly `chunk_size` words with `overlap` words.
    """
    words = text.split()
    if not words:
        return []
    
    chunks = []
    start = 0
    step = chunk_size - overlap
    if step <= 0:
        step = chunk_size

    while start < len(words):
        chunk_words = words[start:start + chunk_size]
        chunk_str = " ".join(chunk_words)
        chunks.append(chunk_str)
        start += step
        if start >= len(words):
            break

    return chunks
