import json
import logging
from collections.abc import AsyncGenerator

from app.utils.git_cloner import unpack_zip_bytes, clone_git_repo, get_workspace_dir
from app.parsers.code_parser import code_parser
from app.embeddings.embedding_service import embedding_service
from app.vectorstore.chroma_store import chroma_store
from app.services.ollama_service import ollama_service
from app.schemas.rag_schema import (
    RAGStatusResponse,
    RAGQueryRequest,
    RAGQueryResultResponse,
)

logger = logging.getLogger(__name__)

# Memory store for active indexing status per workspace
workspace_status_store: dict[str, RAGStatusResponse] = {}


class RAGService:
    def get_status(self, workspace_id: str) -> RAGStatusResponse:
        if workspace_id in workspace_status_store:
            return workspace_status_store[workspace_id]

        stats = chroma_store.get_stats(workspace_id)
        total_chunks = stats["total_chunks"]
        is_indexed = total_chunks > 0

        return RAGStatusResponse(
            workspace_id=workspace_id,
            is_indexed=is_indexed,
            indexed_files=0 if not is_indexed else max(1, total_chunks // 4),
            total_chunks=total_chunks,
            db_status="Ready" if is_indexed else "Empty",
            progress=1.0 if is_indexed else 0.0,
            status_message="Codebase vector index is ready" if is_indexed else "No codebase indexed",
        )

    def ingest_project(
        self, workspace_id: str, zip_bytes: bytes | None = None, git_url: str | None = None
    ) -> RAGStatusResponse:
        try:
            workspace_status_store[workspace_id] = RAGStatusResponse(
                workspace_id=workspace_id,
                is_indexed=False,
                indexed_files=0,
                total_chunks=0,
                db_status="Indexing",
                progress=0.1,
                status_message="Unpacking project source files...",
            )

            # 1. Unpack or clone code
            if zip_bytes:
                target_dir = unpack_zip_bytes(zip_bytes, workspace_id)
            elif git_url:
                target_dir = clone_git_repo(git_url, workspace_id)
            else:
                target_dir = get_workspace_dir(workspace_id)

            workspace_status_store[workspace_id].progress = 0.3
            workspace_status_store[workspace_id].status_message = "Parsing semantic code chunks..."

            # 2. Parse files into semantic chunks
            chunks = code_parser.parse_directory(target_dir)
            unique_files = len(set(c.file_path for c in chunks))

            workspace_status_store[workspace_id].progress = 0.6
            workspace_status_store[workspace_id].status_message = (
                f"Generating embeddings for {len(chunks)} code chunks..."
            )

            # 3. Generate embeddings
            texts = [c.code_snippet for c in chunks]
            embeddings = embedding_service.embed_texts(texts)

            workspace_status_store[workspace_id].progress = 0.8
            workspace_status_store[workspace_id].status_message = "Storing embeddings in ChromaDB..."

            # 4. Save to ChromaDB
            chroma_store.clear_workspace(workspace_id)
            chroma_store.add_chunks(workspace_id, chunks, embeddings)

            status_res = RAGStatusResponse(
                workspace_id=workspace_id,
                is_indexed=True,
                indexed_files=unique_files,
                total_chunks=len(chunks),
                db_status="Ready",
                progress=1.0,
                status_message=f"Successfully indexed {unique_files} files into ChromaDB ({len(chunks)} chunks)",
            )
            workspace_status_store[workspace_id] = status_res
            return status_res

        except Exception as e:
            logger.exception("RAG ingestion error for workspace %s", workspace_id)
            err_res = RAGStatusResponse(
                workspace_id=workspace_id,
                is_indexed=False,
                indexed_files=0,
                total_chunks=0,
                db_status="Error",
                progress=0.0,
                status_message=f"Indexing failed: {str(e)}",
            )
            workspace_status_store[workspace_id] = err_res
            return err_res

    def retrieve_context(self, request: RAGQueryRequest) -> RAGQueryResultResponse:
        query_vec = embedding_service.embed_text(request.prompt)
        chunks = chroma_store.query_similar(request.workspace_id, query_vec, top_k=request.top_k)

        if not chunks:
            return RAGQueryResultResponse(
                retrieved_chunks=[],
                confidence_score=0.0,
                context_size_bytes=0,
            )

        avg_score = round(sum(c.score for c in chunks) / len(chunks), 2)
        total_bytes = sum(len(c.code_snippet.encode("utf-8")) for c in chunks)

        return RAGQueryResultResponse(
            retrieved_chunks=chunks,
            confidence_score=avg_score,
            context_size_bytes=total_bytes,
        )

    async def query_rag_stream(self, request: RAGQueryRequest) -> AsyncGenerator[str, None]:
        # 1. Retrieve top-k semantic code chunks
        rag_res = self.retrieve_context(request)

        # Build metadata header SSE chunk
        meta_payload = json.dumps(
            {
                "rag_metadata": {
                    "confidence_score": rag_res.confidence_score,
                    "context_size_bytes": rag_res.context_size_bytes,
                    "retrieved_chunks": [c.model_dump() for c in rag_res.retrieved_chunks],
                }
            }
        )
        yield f"data: {meta_payload}\n\n"

        # 2. Build augmented RAG prompt
        context_parts: list[str] = []
        for idx, chunk in enumerate(rag_res.retrieved_chunks, start=1):
            context_parts.append(
                f"--- File {idx}: {chunk.file_path} (Lines {chunk.start_line}-{chunk.end_line}) ---\n"
                f"{chunk.code_snippet}\n"
            )

        context_str = "\n".join(context_parts)
        augmented_prompt = (
            f"Here is relevant codebase context retrieved from ChromaDB:\n\n"
            f"{context_str}\n\n"
            f"Based strictly on the codebase context above and user request, answer:\n"
            f"{request.prompt}"
        )

        from app.schemas.chat_schema import ChatRequest

        chat_req = ChatRequest(prompt=augmented_prompt, conversation_history=[])

        # 3. Stream Ollama response
        async for chunk in ollama_service.stream_chat(chat_req):
            yield chunk


rag_service = RAGService()
