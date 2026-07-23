import { http } from '@services/http';
import type { RAGStatus, RAGQueryResult } from '../types/rag.types';

export interface RAGStreamCallbacks {
  onMetadata: (data: RAGQueryResult) => void;
  onChunk: (chunkText: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export class RAGService {
  async uploadProjectZip(workspaceId: string, file: File): Promise<RAGStatus> {
    const formData = new FormData();
    formData.append('workspace_id', workspaceId);
    formData.append('file', file);

    const res = await http.post<RAGStatus>('/rag/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async cloneGitRepo(workspaceId: string, gitUrl: string): Promise<RAGStatus> {
    const formData = new FormData();
    formData.append('workspace_id', workspaceId);
    formData.append('git_url', gitUrl);

    const res = await http.post<RAGStatus>('/rag/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async getRAGStatus(workspaceId: string): Promise<RAGStatus> {
    const res = await http.get<RAGStatus>(`/rag/status/${workspaceId}`);
    return res.data;
  }

  async queryRAGStream(
    workspaceId: string,
    prompt: string,
    callbacks: RAGStreamCallbacks,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          prompt,
          top_k: 5,
        }),
        ...(abortSignal ? { signal: abortSignal } : {}),
      });

      if (!response.ok) {
        throw new Error(`RAG Query failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            callbacks.onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr) as {
              content?: string;
              done?: boolean;
              rag_metadata?: RAGQueryResult;
            };

            if (parsed.rag_metadata) {
              callbacks.onMetadata(parsed.rag_metadata);
            }

            if (parsed.content) {
              callbacks.onChunk(parsed.content);
            }

            if (parsed.done) {
              callbacks.onComplete();
              return;
            }
          } catch {
            if (dataStr) {
              callbacks.onChunk(dataStr);
            }
          }
        }
      }

      callbacks.onComplete();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        callbacks.onComplete();
        return;
      }
      const errorObj = err instanceof Error ? err : new Error('Failed to query RAG assistant');
      callbacks.onError(errorObj);
    }
  }
}

export const ragService = new RAGService();
