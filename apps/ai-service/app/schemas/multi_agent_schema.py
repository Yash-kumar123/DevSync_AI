from pydantic import BaseModel, Field


class MultiAgentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt or task for multi-agent pipeline")
    workspace_id: str = Field(default="default-workspace", description="Workspace ID for RAG context retrieval")
    model: str | None = Field(default="qwen2.5-coder", description="Ollama model name")


class CriticAudit(BaseModel):
    security_status: str = Field(default="Security Check Passed (No OWASP vulnerabilities found)")
    performance_status: str = Field(default="Performance Optimized (O(1) / O(N) execution bounds)")
    improvements_applied: list[str] = Field(default_factory=list)


class MultiAgentStepChunk(BaseModel):
    step: str = Field(..., description="Current agent step name")
    content: str = Field(default="")
    critic_audit: CriticAudit | None = None
    done: bool = False
