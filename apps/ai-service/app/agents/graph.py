import logging
from langgraph.graph import StateGraph, START, END

from app.agents.state import AgentState
from app.agents.builder_agent import builder_node
from app.agents.critic_agent import critic_node
from app.vectorstore.chroma_store import chroma_store
from app.embeddings.embedding_service import embedding_service

logger = logging.getLogger(__name__)


async def retrieve_context_node(state: AgentState) -> dict[str, str]:
    workspace_id = state.get("workspace_id", "default-workspace")
    prompt = state.get("prompt", "")

    query_vec = embedding_service.embed_text(prompt)
    chunks = chroma_store.query_similar(workspace_id, query_vec, top_k=3)

    if not chunks:
        return {"context": "No codebase context retrieved."}

    context_parts: list[str] = []
    for c in chunks:
        context_parts.append(f"File {c.file_path} (Lines {c.start_line}-{c.end_line}):\n{c.code_snippet}")

    context_str = "\n\n".join(context_parts)
    logger.info("Retrieved %d context chunks for Multi-Agent graph", len(chunks))
    return {"context": context_str}


def build_multi_agent_graph():
    builder = StateGraph(AgentState)

    builder.add_node("retrieve_context", retrieve_context_node)
    builder.add_node("builder", builder_node)
    builder.add_node("critic", critic_node)

    builder.add_edge(START, "retrieve_context")
    builder.add_edge("retrieve_context", "builder")
    builder.add_edge("builder", "critic")
    builder.add_edge("critic", END)

    return builder.compile()


multi_agent_graph = build_multi_agent_graph()
