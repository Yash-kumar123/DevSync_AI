// =============================================================================
// DevSync AI — Terminal & Code Execution DTOs
// =============================================================================

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'killed';

export interface RunCodeDTO {
  workspaceId: string;
  fileName: string;
  language: string;
  code: string;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  exitCode: number;
  output: string;
  durationMs: number;
}

export interface TerminalSession {
  id: string;
  workspaceId: string;
  title: string;
  active: boolean;
  createdAt: string;
  status: ExecutionStatus;
  exitCode?: number;
  durationMs?: number;
}

export interface ContainerResourceLimits {
  cpus: number; // e.g. 0.5
  memoryMb: number; // e.g. 256
  timeoutSeconds: number; // e.g. 10
}
