import os
import logging
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import get_settings
from app.parsers.code_parser import CodeChunk
from app.schemas.rag_schema import RetrievedChunk

logger = logging.getLogger(__name__)
settings = get_settings()


class ChromaVectorStore:
    def __init__(self) -> None:
        os.makedirs(settings.chroma_persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_directory,
            settings=ChromaSettings(allow_reset=True, anonymized_telemetry=False),
        )

    def _get_collection_name(self, workspace_id: str) -> str:
        clean_id = "".join(c if c.isalnum() else "_" for c in workspace_id).lower()
        return f"rag_{clean_id}"

    def get_or_create_collection(self, workspace_id: str):
        collection_name = self._get_collection_name(workspace_id)
        return self.client.get_or_create_collection(name=collection_name)

    def add_chunks(
        self, workspace_id: str, chunks: list[CodeChunk], embeddings: list[list[float]]
    ) -> None:
        if not chunks:
            return

        collection = self.get_or_create_collection(workspace_id)

        ids = [f"{workspace_id}_{idx}" for idx in range(len(chunks))]
        documents = [c.code_snippet for c in chunks]
        metadatas = [
            {
                "file_path": c.file_path,
                "start_line": c.start_line,
                "end_line": c.end_line,
            }
            for c in chunks
        ]

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )
        logger.info("Added %d chunks to ChromaDB collection for %s", len(chunks), workspace_id)

    def query_similar(
        self, workspace_id: str, query_embedding: list[float], top_k: int = 5
    ) -> list[RetrievedChunk]:
        try:
            collection = self.get_or_create_collection(workspace_id)
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, max(1, collection.count())),
                include=["documents", "metadatas", "distances"],
            )

            retrieved: list[RetrievedChunk] = []

            if not results or not results.get("documents") or not results["documents"][0]:
                return retrieved

            docs = results["documents"][0]
            metas = results["metadatas"][0] if results.get("metadatas") else []
            distances = results["distances"][0] if results.get("distances") else []

            for idx, doc in enumerate(docs):
                meta = metas[idx] if idx < len(metas) else {}
                dist = distances[idx] if idx < len(distances) else 0.5
                # Convert distance to similarity score
                score = round(max(0.0, 1.0 - (dist / 2.0)), 2)

                retrieved.append(
                    RetrievedChunk(
                        file_path=str(meta.get("file_path", "unknown")),
                        code_snippet=doc,
                        score=score,
                        start_line=int(meta.get("start_line", 1)),
                        end_line=int(meta.get("end_line", 1)),
                    )
                )

            return retrieved
        except Exception as e:
            logger.error("ChromaDB query error for workspace %s: %s", workspace_id, str(e))
            return []

    def get_stats(self, workspace_id: str) -> dict[str, int]:
        try:
            collection = self.get_or_create_collection(workspace_id)
            count = collection.count()
            return {"total_chunks": count}
        except Exception:
            return {"total_chunks": 0}

    def clear_workspace(self, workspace_id: str) -> None:
        try:
            collection_name = self._get_collection_name(workspace_id)
            self.client.delete_collection(name=collection_name)
        except Exception:
            pass


chroma_store = ChromaVectorStore()
