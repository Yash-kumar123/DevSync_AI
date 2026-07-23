import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.schemas.chat_schema import ChatRequest
from app.services.ollama_service import ollama_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["chat"])


@router.post("/chat")
@router.post("/ai/chat")
async def chat_endpoint(request: ChatRequest) -> StreamingResponse:
    """Stream AI code generation response token by token."""
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt must not be empty"
        )

    logger.info("Received AI chat prompt: %s...", request.prompt[:50])

    return StreamingResponse(
        ollama_service.stream_chat(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
