// =============================================================================
// DevSync AI — Frontend RAG Types
// =============================================================================

export interface RAGStatus {
  workspace_id: string;
  is_indexed: boolean;
  indexed_files: number;
  total_chunks: number;
  db_status: 'Ready' | 'Indexing' | 'Empty' | 'Error';
  progress: number;
  status_message: string;
}

export interface RetrievedChunk {
  file_path: string;
  code_snippet: string;
  score: number;
  start_line: number;
  end_line: number;
}

export interface RAGQueryResult {
  retrieved_chunks: RetrievedChunk[];
  confidence_score: number;
  context_size_bytes: number;
}
