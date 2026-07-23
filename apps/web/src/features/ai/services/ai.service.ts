import { getApiBaseUrl } from '@services/http';
import type { AIChatMessage } from '../types/ai.types';

export interface StreamCallbacks {
  onChunk: (chunkText: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export class AIService {
  private getApiUrl(): string {
    return `${getApiBaseUrl()}/ai/chat`;
  }

  async streamChat(
    prompt: string,
    history: AIChatMessage[],
    callbacks: StreamCallbacks,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    try {
      const payload = {
        prompt,
        conversation_history: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: 'qwen2.5-coder',
      };

      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        ...(abortSignal ? { signal: abortSignal } : {}),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
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
        buffer = lines.pop() || ''; // Keep incomplete line fragment in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            callbacks.onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr) as { content?: string; done?: boolean };
            if (parsed.content) {
              callbacks.onChunk(parsed.content);
            }
            if (parsed.done) {
              callbacks.onComplete();
              return;
            }
          } catch {
            // Raw text chunk fallback
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
      const errorObj = err instanceof Error ? err : new Error('Failed to stream AI response');
      callbacks.onError(errorObj);
    }
  }
}

export const aiService = new AIService();
