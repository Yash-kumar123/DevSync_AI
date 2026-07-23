import { http } from '@services/http';
import type { GitStatus, GitBranch, GitCommit, GitDiff } from '../types/git.types';

export class GitService {
  async getStatus(workspaceId: string): Promise<GitStatus> {
    const res = await http.get<{ success: boolean; data: GitStatus }>(
      `/v1/git/status/${workspaceId}`,
    );
    return res.data.data;
  }

  async stageFiles(workspaceId: string, filePaths: string[]): Promise<void> {
    await http.post('/v1/git/stage', { workspaceId, filePaths });
  }

  async unstageFiles(workspaceId: string, filePaths: string[]): Promise<void> {
    await http.post('/v1/git/unstage', { workspaceId, filePaths });
  }

  async commit(workspaceId: string, message: string): Promise<string> {
    const res = await http.post<{ success: boolean; data: { commitHash: string } }>(
      '/v1/git/commit',
      {
        workspaceId,
        message,
      },
    );
    return res.data.data.commitHash;
  }

  async push(workspaceId: string): Promise<void> {
    await http.post('/v1/git/push', { workspaceId });
  }

  async pull(workspaceId: string): Promise<void> {
    await http.post('/v1/git/pull', { workspaceId });
  }

  async fetchRemote(workspaceId: string): Promise<void> {
    await http.post('/v1/git/fetch', { workspaceId });
  }

  async getBranches(workspaceId: string): Promise<GitBranch[]> {
    const res = await http.get<{ success: boolean; data: GitBranch[] }>(
      `/v1/git/branches/${workspaceId}`,
    );
    return res.data.data;
  }

  async createBranch(workspaceId: string, branchName: string): Promise<void> {
    await http.post('/v1/git/branch/create', { workspaceId, branchName });
  }

  async checkoutBranch(workspaceId: string, branchName: string): Promise<void> {
    await http.post('/v1/git/branch/checkout', { workspaceId, branchName });
  }

  async deleteBranch(workspaceId: string, branchName: string): Promise<void> {
    await http.delete(`/v1/git/branch/${workspaceId}/${branchName}`);
  }

  async getHistory(workspaceId: string): Promise<GitCommit[]> {
    const res = await http.get<{ success: boolean; data: GitCommit[] }>(
      `/v1/git/history/${workspaceId}`,
    );
    return res.data.data;
  }

  async getDiff(workspaceId: string, filePath: string): Promise<GitDiff> {
    const res = await http.get<{ success: boolean; data: GitDiff }>(
      `/v1/git/diff/${workspaceId}?filePath=${encodeURIComponent(filePath)}`,
    );
    return res.data.data;
  }

  async discardChanges(workspaceId: string, filePath: string): Promise<void> {
    await http.post('/v1/git/discard', { workspaceId, filePath });
  }
}

export const gitService = new GitService();
