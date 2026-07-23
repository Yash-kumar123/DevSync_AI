import math
import re
import logging

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 384


class EmbeddingService:
    """Fast, deterministic semantic vector embedding generator for code text."""

    def __init__(self) -> None:
        self.dim = EMBEDDING_DIM

    def embed_text(self, text: str) -> list[float]:
        """Generate a normalized semantic dense vector for text snippet."""
        tokens = re.findall(r"\w+", text.lower())
        vec = [0.0] * self.dim

        if not tokens:
            return vec

        for token in tokens:
            # Hash token into vector dimension index
            h = hash(token) % self.dim
            vec[h] += 1.0

        # L2 normalize
        magnitude = math.sqrt(sum(v * v for v in vec))
        if magnitude > 0:
            vec = [v / magnitude for v in vec]

        return vec

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return [self.embed_text(t) for t in texts]


embedding_service = EmbeddingService()
