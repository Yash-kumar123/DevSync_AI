// =============================================================================
// DevSync AI — Frontend Terminal Types
// =============================================================================

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'killed';

export interface TerminalTab {
  id: string;
  title: string;
  content: string;
  status: ExecutionStatus;
  exitCode?: number;
  durationMs?: number;
}

export interface RunCodePayload {
  workspaceId: string;
  fileName: string;
  language: string;
  code: string;
}

export interface ExecutionResultResponse {
  status: ExecutionStatus;
  exitCode: number;
  output: string;
  durationMs: number;
}
