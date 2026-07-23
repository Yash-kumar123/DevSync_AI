from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from app.schemas.chat_schema import ChatRequest

SYSTEM_PROMPT = (
    "You are DevSync AI, an expert Senior AI Pair Programmer. "
    "Provide clear, concise, production-grade code, explanations, and refactoring guidance. "
    "Use markdown code blocks with language identifiers for all code snippets."
)


class BaseAIProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns the identifier name of the AI provider (e.g. 'groq', 'ollama')."""
        pass

    @abstractmethod
    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        """Streams AI chat response as SSE formatted strings."""
        pass

    @abstractmethod
    async def chat(self, request: ChatRequest) -> str:
        """Executes a non-streaming completion and returns text response."""
        pass

    async def embeddings(self, text: str) -> list[float]:
        """Optional embeddings generator for future provider extension."""
        return []
