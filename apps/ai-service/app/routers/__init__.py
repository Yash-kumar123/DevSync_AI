from fastapi import APIRouter

from .health import router as health_router
from .chat_router import router as chat_router
from .rag_router import router as rag_router
from .multi_agent_router import router as multi_agent_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(chat_router, tags=["chat"])
api_router.include_router(rag_router, tags=["rag"])
api_router.include_router(multi_agent_router, tags=["multi-agent"])
