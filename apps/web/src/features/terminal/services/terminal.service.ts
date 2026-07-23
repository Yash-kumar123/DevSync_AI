import { http } from '@services/http';
import type { RunCodePayload, ExecutionResultResponse } from '../types/terminal.types';

export class TerminalService {
  async runCode(payload: RunCodePayload): Promise<ExecutionResultResponse> {
    const res = await http.post<{ success: boolean; data: ExecutionResultResponse }>(
      '/v1/terminal/run',
      payload,
    );
    return res.data.data;
  }

  async killCode(workspaceId: string): Promise<boolean> {
    const res = await http.post<{ success: boolean; data: { killed: boolean } }>(
      '/v1/terminal/kill',
      { workspaceId },
    );
    return res.data.data.killed;
  }
}

export const terminalService = new TerminalService();
