from typing import Literal
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt for the AI assistant")
    conversation_history: list[ChatMessage] = Field(
        default_factory=list, description="Chronological conversation history"
    )
    model: str | None = Field(
        default="qwen2.5-coder", description="Ollama model name (e.g. qwen2.5-coder or deepseek-coder)"
    )


class ChatResponseChunk(BaseModel):
    content: str
    done: bool = False
