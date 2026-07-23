// =============================================================================
// DevSync AI — Frontend AI Chat Types
// =============================================================================

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface StreamChunkPayload {
  content?: string | undefined;
  done?: boolean | undefined;
}
