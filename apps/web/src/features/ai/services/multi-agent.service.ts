import { getApiBaseUrl } from '@services/http';
import type { MultiAgentStepPayload } from '../types/multi-agent.types';

export interface MultiAgentStreamCallbacks {
  onStepChange: (step: MultiAgentStepPayload) => void;
  onChunk: (chunkText: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export class MultiAgentService {
  async streamPipeline(
    workspaceId: string,
    prompt: string,
    callbacks: MultiAgentStreamCallbacks,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/ai/multi-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          prompt,
          model: 'qwen2.5-coder',
        }),
        ...(abortSignal ? { signal: abortSignal } : {}),
      });

      if (!response.ok) {
        throw new Error(`Multi-Agent pipeline returned status ${response.status}`);
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
            const parsed = JSON.parse(dataStr) as MultiAgentStepPayload;

            if (parsed.step) {
              callbacks.onStepChange(parsed);
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
      const errorObj = err instanceof Error ? err : new Error('Multi-Agent pipeline failed');
      callbacks.onError(errorObj);
    }
  }
}

export const multiAgentService = new MultiAgentService();
