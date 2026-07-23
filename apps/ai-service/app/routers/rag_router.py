import logging
from typing import Annotated
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from fastapi.responses import StreamingResponse

from app.schemas.rag_schema import (
    RAGQueryRequest,
    RAGStatusResponse,
)
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["rag"])


@router.post("/rag/upload")
@router.post("/api/rag/upload")
async def upload_project(
    workspace_id: Annotated[str, Form()],
    git_url: Annotated[str | None, Form()] = None,
    file: Annotated[UploadFile | None, File()] = None,
) -> RAGStatusResponse:
    """Ingest project codebase via ZIP upload or Git URL."""
    if not workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="workspace_id is required"
        )

    zip_bytes = None
    if file:
        zip_bytes = await file.read()

    if not zip_bytes and not git_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a ZIP file or git_url must be provided",
        )

    logger.info("Starting RAG codebase upload for workspace %s", workspace_id)
    return rag_service.ingest_project(workspace_id, zip_bytes=zip_bytes, git_url=git_url)


@router.get("/rag/status/{workspace_id}")
@router.get("/api/rag/status/{workspace_id}")
async def get_rag_status(workspace_id: str) -> RAGStatusResponse:
    """Get vector store indexing status for a workspace."""
    return rag_service.get_status(workspace_id)


@router.post("/rag/query")
@router.post("/api/rag/query")
async def query_rag(request: RAGQueryRequest) -> StreamingResponse:
    """Perform RAG codebase retrieval and stream AI generation response."""
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required"
        )

    return StreamingResponse(
        rag_service.query_rag_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
