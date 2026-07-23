import type { Request, Response } from 'express';
import { gitService } from './git.service.js';

export class GitController {
  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['workspaceId'];
      const workspaceId = Array.isArray(paramVal) ? paramVal[0] : paramVal;

      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID required' });
        return;
      }

      const status = await gitService.getStatus(workspaceId);
      res.status(200).json({ success: true, data: status });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Git status';
      res.status(500).json({ success: false, error: message });
    }
  };

  stageFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, filePaths } = req.body;
      await gitService.stageFiles(workspaceId || 'default-workspace', filePaths || ['.']);
      res.status(200).json({ success: true, message: 'Files staged successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to stage files';
      res.status(400).json({ success: false, error: message });
    }
  };

  unstageFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, filePaths } = req.body;
      await gitService.unstageFiles(workspaceId || 'default-workspace', filePaths || ['.']);
      res.status(200).json({ success: true, message: 'Files unstaged successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to unstage files';
      res.status(400).json({ success: false, error: message });
    }
  };

  commit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, message } = req.body;
      if (!message || !message.trim()) {
        res.status(400).json({ success: false, error: 'Commit message is required' });
        return;
      }

      const commitHash = await gitService.commit(workspaceId || 'default-workspace', message);
      res.status(200).json({ success: true, data: { commitHash } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Commit failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  push = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.body;
      await gitService.push(workspaceId || 'default-workspace');
      res.status(200).json({ success: true, message: 'Pushed changes to remote' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Push failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  pull = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.body;
      await gitService.pull(workspaceId || 'default-workspace');
      res.status(200).json({ success: true, message: 'Pulled latest changes from remote' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Pull failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  fetchRemote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.body;
      await gitService.fetch(workspaceId || 'default-workspace');
      res.status(200).json({ success: true, message: 'Fetched remote updates' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  getBranches = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['workspaceId'];
      const workspaceId = Array.isArray(paramVal) ? paramVal[0] : paramVal;

      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID required' });
        return;
      }

      const branches = await gitService.getBranches(workspaceId);
      res.status(200).json({ success: true, data: branches });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch branches';
      res.status(500).json({ success: false, error: message });
    }
  };

  createBranch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, branchName } = req.body;
      if (!branchName) {
        res.status(400).json({ success: false, error: 'Branch name required' });
        return;
      }

      await gitService.createBranch(workspaceId || 'default-workspace', branchName);
      res.status(201).json({ success: true, message: `Branch '${branchName}' created` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Create branch failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  checkoutBranch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, branchName } = req.body;
      if (!branchName) {
        res.status(400).json({ success: false, error: 'Branch name required' });
        return;
      }

      await gitService.checkoutBranch(workspaceId || 'default-workspace', branchName);
      res.status(200).json({ success: true, message: `Switched to branch '${branchName}'` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout branch failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  deleteBranch = async (req: Request, res: Response): Promise<void> => {
    try {
      const workspaceParam = req.params['workspaceId'];
      const branchParam = req.params['branchName'];

      const workspaceId = Array.isArray(workspaceParam) ? workspaceParam[0] : workspaceParam;
      const branchName = Array.isArray(branchParam) ? branchParam[0] : branchParam;

      if (!workspaceId || !branchName) {
        res.status(400).json({ success: false, error: 'Workspace ID and branch name required' });
        return;
      }

      await gitService.deleteBranch(workspaceId, branchName);
      res.status(200).json({ success: true, message: `Branch '${branchName}' deleted` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete branch failed';
      res.status(400).json({ success: false, error: message });
    }
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['workspaceId'];
      const workspaceId = Array.isArray(paramVal) ? paramVal[0] : paramVal;

      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID required' });
        return;
      }

      const history = await gitService.getCommitHistory(workspaceId);
      res.status(200).json({ success: true, data: history });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch commit history';
      res.status(500).json({ success: false, error: message });
    }
  };

  getDiff = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['workspaceId'];
      const workspaceId = Array.isArray(paramVal) ? paramVal[0] : paramVal;
      const filePath = req.query['filePath'] as string;

      if (!workspaceId || !filePath) {
        res.status(400).json({ success: false, error: 'Workspace ID and filePath required' });
        return;
      }

      const diff = await gitService.getFileDiff(workspaceId, filePath);
      res.status(200).json({ success: true, data: diff });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch diff';
      res.status(500).json({ success: false, error: message });
    }
  };

  discardChanges = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workspaceId, filePath } = req.body;
      if (!filePath) {
        res.status(400).json({ success: false, error: 'filePath is required' });
        return;
      }

      await gitService.discardChanges(workspaceId || 'default-workspace', filePath);
      res.status(200).json({ success: true, message: `Discarded changes for ${filePath}` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to discard changes';
      res.status(400).json({ success: false, error: message });
    }
  };
}

export const gitController = new GitController();
