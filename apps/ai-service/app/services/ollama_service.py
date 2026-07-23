import logging
from collections.abc import AsyncGenerator

from app.schemas.chat_schema import ChatRequest
from app.providers.provider_factory import get_ai_provider

logger = logging.getLogger(__name__)


class OllamaService:
    """
    Backward-compatible delegation service.
    Delegates all chat operations to the active BaseAIProvider configured via ProviderFactory (AI_PROVIDER=groq or AI_PROVIDER=ollama).
    """

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        provider = get_ai_provider()
        async for chunk in provider.stream_chat(request):
            yield chunk

    async def chat(self, request: ChatRequest) -> str:
        provider = get_ai_provider()
        return await provider.chat(request)


ollama_service = OllamaService()
