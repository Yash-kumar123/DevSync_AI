import logging
from app.config import get_settings
from app.providers.base import BaseAIProvider
from app.providers.groq_provider import GroqProvider
from app.providers.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)


class ProviderFactory:
    _instances: dict[str, BaseAIProvider] = {}

    @classmethod
    def get_provider(cls, provider_type: str | None = None) -> BaseAIProvider:
        """
        Factory method returning the active AI provider based on environment config:
        AI_PROVIDER=groq or AI_PROVIDER=ollama
        """
        settings = get_settings()
        selected_provider = (provider_type or settings.ai_provider or "groq").lower().strip()

        if selected_provider not in cls._instances:
            if selected_provider == "groq":
                logger.info("Initializing Groq AI Provider (Model: %s)", settings.groq_model)
                cls._instances["groq"] = GroqProvider()
            elif selected_provider == "ollama":
                logger.info(
                    "Initializing Ollama AI Provider (Base URL: %s, Model: %s)",
                    settings.ollama_base_url,
                    settings.ollama_model,
                )
                cls._instances["ollama"] = OllamaProvider()
            else:
                logger.warning(
                    "Unknown AI_PROVIDER '%s'. Defaulting to Groq AI Provider.", selected_provider
                )
                cls._instances[selected_provider] = GroqProvider()

        return cls._instances[selected_provider]


def get_ai_provider() -> BaseAIProvider:
    """Dependency injection helper returning active BaseAIProvider instance."""
    return ProviderFactory.get_provider()
