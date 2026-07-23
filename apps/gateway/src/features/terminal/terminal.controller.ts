import type { Request, Response } from 'express';
import { terminalService } from './terminal.service.js';

export class TerminalController {
  runCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, fileName, language, code } = req.body;

      if (!code || !language) {
        res.status(400).json({ success: false, error: 'Code and language are required' });
        return;
      }

      const result = await terminalService.runCode({
        workspaceId: workspaceId || 'default-workspace',
        fileName: fileName || 'script.js',
        language,
        code,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      res.status(500).json({ success: false, error: message });
    }
  };

  killCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.body;
      const killed = terminalService.killCode(workspaceId || 'default-workspace');
      res.status(200).json({ success: true, data: { killed } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to kill process';
      res.status(500).json({ success: false, error: message });
    }
  };
}

export const terminalController = new TerminalController();
