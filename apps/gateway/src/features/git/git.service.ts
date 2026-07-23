import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { simpleGit, type SimpleGit, type StatusResult } from 'simple-git';
import type {
  GitStatusResponse,
  GitFileChange,
  GitBranchInfo,
  GitCommitInfo,
  GitDiffResponse,
} from './git.types.js';

export class GitService {
  private getWorkspaceDir(workspaceId: string): string {
    const tempDir = path.join(os.tmpdir(), 'devsync_rag', workspaceId);
    if (fs.existsSync(tempDir)) {
      return tempDir;
    }
    // Fallback workspace dir
    const baseDir = path.join(os.tmpdir(), 'devsync_workspaces', workspaceId);
    fs.mkdirSync(baseDir, { recursive: true });
    return baseDir;
  }

  private async getGitInstance(workspaceId: string): Promise<SimpleGit> {
    const dir = this.getWorkspaceDir(workspaceId);
    const git = simpleGit(dir);

    // Initialize git repo if not already initialized
    if (!fs.existsSync(path.join(dir, '.git'))) {
      try {
        await git.init();
      } catch {
        // ignore if init already ran
      }
    }
    return git;
  }

  public async getStatus(workspaceId: string): Promise<GitStatusResponse> {
    try {
      const git = await this.getGitInstance(workspaceId);
      const status: StatusResult = await git.status();

      const staged: GitFileChange[] = [];
      const unstaged: GitFileChange[] = [];

      for (const f of status.staged) {
        staged.push({
          path: f,
          status: 'M',
          staged: true,
        });
      }

      for (const f of status.created) {
        if (!status.staged.includes(f)) {
          unstaged.push({ path: f, status: 'A', staged: false });
        }
      }

      for (const f of status.modified) {
        if (!status.staged.includes(f)) {
          unstaged.push({ path: f, status: 'M', staged: false });
        }
      }

      for (const f of status.deleted) {
        if (!status.staged.includes(f)) {
          unstaged.push({ path: f, status: 'D', staged: false });
        }
      }

      for (const f of status.not_added) {
        unstaged.push({ path: f, status: '?', staged: false });
      }

      return {
        currentBranch: status.current || 'main',
        isClean: status.isClean(),
        staged,
        unstaged,
        ahead: status.ahead,
        behind: status.behind,
      };
    } catch {
      return {
        currentBranch: 'main',
        isClean: true,
        staged: [],
        unstaged: [],
        ahead: 0,
        behind: 0,
      };
    }
  }

  public async stageFiles(workspaceId: string, filePaths: string[]): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    if (filePaths.length === 0 || filePaths.includes('.')) {
      await git.add('.');
    } else {
      await git.add(filePaths);
    }
  }

  public async unstageFiles(workspaceId: string, filePaths: string[]): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    if (filePaths.length === 0 || filePaths.includes('.')) {
      await git.reset(['HEAD']);
    } else {
      await git.reset(['HEAD', ...filePaths]);
    }
  }

  public async commit(workspaceId: string, message: string): Promise<string> {
    const git = await this.getGitInstance(workspaceId);
    const res = await git.commit(message);
    return res.commit || 'head';
  }

  public async push(workspaceId: string): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    await git.push();
  }

  public async pull(workspaceId: string): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    await git.pull();
  }

  public async fetch(workspaceId: string): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    await git.fetch();
  }

  public async getBranches(workspaceId: string): Promise<GitBranchInfo[]> {
    try {
      const git = await this.getGitInstance(workspaceId);
      const summary = await git.branch();

      return Object.values(summary.branches).map((b) => ({
        name: b.name,
        current: b.current,
        commitHash: b.commit,
      }));
    } catch {
      return [{ name: 'main', current: true, commitHash: 'head' }];
    }
  }

  public async createBranch(workspaceId: string, branchName: string): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    await git.checkoutLocalBranch(branchName);
  }

  public async checkoutBranch(workspaceId: string, branchName: string): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    await git.checkout(branchName);
  }

  public async deleteBranch(workspaceId: string, branchName: string): Promise<void> {
    const git = await this.getGitInstance(workspaceId);
    await git.deleteLocalBranch(branchName);
  }

  public async getCommitHistory(workspaceId: string): Promise<GitCommitInfo[]> {
    try {
      const git = await this.getGitInstance(workspaceId);
      const log = await git.log({ maxCount: 20 });

      return log.all.map((c) => ({
        hash: c.hash.substring(0, 7),
        date: c.date,
        message: c.message,
        author_name: c.author_name,
        author_email: c.author_email,
      }));
    } catch {
      return [];
    }
  }

  public async getFileDiff(workspaceId: string, filePath: string): Promise<GitDiffResponse> {
    try {
      const git = await this.getGitInstance(workspaceId);
      const diff = await git.diff([filePath]);
      return { filePath, diff };
    } catch {
      return { filePath, diff: '' };
    }
  }

  public async discardChanges(workspaceId: string, filePath: string): Promise<void> {
    try {
      const git = await this.getGitInstance(workspaceId);
      await git.checkout(['--', filePath]);
    } catch {
      // ignore if checkout fails
    }
  }
}

export const gitService = new GitService();
