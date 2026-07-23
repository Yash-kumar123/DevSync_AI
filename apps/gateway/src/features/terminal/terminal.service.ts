import { dockerService } from './docker.service.js';
import type { RunCodeDTO, ExecutionResult } from './terminal.types.js';

export class TerminalService {
  async runCode(dto: RunCodeDTO, onOutputChunk?: (data: string) => void): Promise<ExecutionResult> {
    return dockerService.executeCode(dto, onOutputChunk);
  }

  killCode(workspaceId: string): boolean {
    return dockerService.killExecution(workspaceId);
  }
}

export const terminalService = new TerminalService();
