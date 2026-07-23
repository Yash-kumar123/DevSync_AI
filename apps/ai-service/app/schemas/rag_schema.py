from pydantic import BaseModel, Field


class RAGUploadRequest(BaseModel):
    workspace_id: str = Field(..., description="Unique workspace or room code identifier")
    git_url: str | None = Field(default=None, description="Optional public Git repository URL to clone")


class RAGQueryRequest(BaseModel):
    workspace_id: str = Field(..., description="Unique workspace or room code identifier")
    prompt: str = Field(..., min_length=1, description="Question or prompt about the codebase")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of relevant code chunks to retrieve")


class RetrievedChunk(BaseModel):
    file_path: str
    code_snippet: str
    score: float
    start_line: int
    end_line: int


class RAGStatusResponse(BaseModel):
    workspace_id: str
    is_indexed: bool
    indexed_files: int
    total_chunks: int
    db_status: str
    progress: float
    status_message: str


class RAGQueryResultResponse(BaseModel):
    retrieved_chunks: list[RetrievedChunk]
    confidence_score: float
    context_size_bytes: int
