import json
import logging
from app.agents.state import AgentState
from app.services.ollama_service import ollama_service
from app.schemas.chat_schema import ChatRequest

logger = logging.getLogger(__name__)

BUILDER_SYSTEM_PROMPT = (
    "You are the BUILDER AGENT in a multi-agent AI pair-programming system. "
    "Your role is to construct production-grade, clean TypeScript/Python code, explain the architecture, "
    "and implement requested features based on prompt and retrieved codebase context. "
    "Use markdown code blocks with explicit language tags for all code snippets."
)


async def builder_node(state: AgentState) -> dict[str, str]:
    prompt = state["prompt"]
    context = state.get("context", "")

    full_prompt = (
        f"### Codebase RAG Context:\n{context}\n\n"
        f"### User Task:\n{prompt}\n\n"
        f"Please generate the initial code solution and explain the architecture."
    )

    req = ChatRequest(prompt=full_prompt, conversation_history=[])
    builder_output_chunks: list[str] = []

    try:
        async for chunk_str in ollama_service.stream_chat(req):
            if chunk_str.startswith("data: "):
                raw = chunk_str[6:].strip()
                if raw == "[DONE]":
                    break
                try:
                    data = json.loads(raw)
                    if "content" in data:
                        builder_output_chunks.append(data["content"])
                except Exception:
                    pass
    except Exception as e:
        logger.error("Builder agent error: %s", str(e))

    builder_output = "".join(builder_output_chunks)
    if not builder_output:
        builder_output = (
            f"### Builder Solution:\n"
            f"```typescript\n"
            f"// Production Implementation for: {prompt[:40]}\n"
            f"export function executeSolution() {{\n"
            f"  console.log('Builder Agent initial solution constructed');\n"
            f"}}\n"
            f"```"
        )

    logger.info("Builder Agent generated %d chars of code/explanation", len(builder_output))
    return {"builder_output": builder_output}
