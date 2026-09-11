import math
import re
from typing import List

def get_text_embedding(text: str, dim: int = 128) -> List[float]:
    """
    Generates a deterministic 128-dimensional embedding vector for input text.
    Uses term frequency hashing for fast, dependency-free embedding calculation.
    """
    words = re.findall(r'\w+', text.lower())
    vec = [0.0] * dim
    if not words:
        return vec

    for word in words:
        h = hash(word) % dim
        vec[h] += 1.0

    # L2 normalize vector
    magnitude = math.sqrt(sum(v * v for v in vec))
    if magnitude > 0:
        vec = [v / magnitude for v in vec]

    return vec

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product / (mag1 * mag2)
