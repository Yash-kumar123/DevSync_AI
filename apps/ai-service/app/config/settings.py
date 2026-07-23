from functools import lru_cache
from typing import Annotated

from pydantic import BeforeValidator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def split_origins(value: str | list[str]) -> list[str]:
    if isinstance(value, str):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    return value


CorsOrigins = Annotated[list[str], BeforeValidator(split_origins)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        enable_decoding=False,
    )

    app_name: str = "DevSync AI Service"
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = Field(default=5000, ge=1, le=65535)
    cors_origins: CorsOrigins = ["http://localhost:3000"]
    log_level: str = "INFO"

    # AI Provider Selection: 'groq' or 'ollama'
    ai_provider: str = "groq"

    # Groq Configuration
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Ollama Configuration
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5-coder:7b"

    # Vectorstore
    chroma_persist_directory: str = ".chroma"


@lru_cache
def get_settings() -> Settings:
    return Settings()
