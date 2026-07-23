import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { GitStatus, GitBranch, GitCommit, GitDiff } from '../types/git.types';
import { gitService } from '../services/git.service';

interface GitStoreState {
  status: GitStatus | null;
  branches: GitBranch[];
  commits: GitCommit[];
  activeDiff: GitDiff | null;
  showDiffModal: boolean;
  isLoading: boolean;

  fetchStatus: (workspaceId: string) => Promise<void>;
  stageFile: (workspaceId: string, filePath: string) => Promise<void>;
  unstageFile: (workspaceId: string, filePath: string) => Promise<void>;
  stageAll: (workspaceId: string) => Promise<void>;
  unstageAll: (workspaceId: string) => Promise<void>;
  commit: (workspaceId: string, message: string) => Promise<void>;
  push: (workspaceId: string) => Promise<void>;
  pull: (workspaceId: string) => Promise<void>;
  fetchRemote: (workspaceId: string) => Promise<void>;
  fetchBranches: (workspaceId: string) => Promise<void>;
  createBranch: (workspaceId: string, branchName: string) => Promise<void>;
  checkoutBranch: (workspaceId: string, branchName: string) => Promise<void>;
  deleteBranch: (workspaceId: string, branchName: string) => Promise<void>;
  loadCommitHistory: (workspaceId: string) => Promise<void>;
  loadDiff: (workspaceId: string, filePath: string) => Promise<void>;
  closeDiffModal: () => void;
  discardChanges: (workspaceId: string, filePath: string) => Promise<void>;
}

export const useGitStore = create<GitStoreState>((set, get) => ({
  status: null,
  branches: [],
  commits: [],
  activeDiff: null,
  showDiffModal: false,
  isLoading: false,

  fetchStatus: async (workspaceId: string) => {
    try {
      set({ isLoading: true });
      const status = await gitService.getStatus(workspaceId);
      set({ status, isLoading: false });
    } catch {
      // Fallback empty status if git repo not present
      set({
        status: {
          currentBranch: 'main',
          isClean: true,
          staged: [],
          unstaged: [],
          ahead: 0,
          behind: 0,
        },
        isLoading: false,
      });
    }
  },

  stageFile: async (workspaceId: string, filePath: string) => {
    try {
      await gitService.stageFiles(workspaceId, [filePath]);
      await get().fetchStatus(workspaceId);
      toast.success(`Staged ${filePath.split('/').pop()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stage failed';
      toast.error(msg);
    }
  },

  unstageFile: async (workspaceId: string, filePath: string) => {
    try {
      await gitService.unstageFiles(workspaceId, [filePath]);
      await get().fetchStatus(workspaceId);
      toast.success(`Unstaged ${filePath.split('/').pop()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unstage failed';
      toast.error(msg);
    }
  },

  stageAll: async (workspaceId: string) => {
    try {
      await gitService.stageFiles(workspaceId, ['.']);
      await get().fetchStatus(workspaceId);
      toast.success('Staged all changes');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stage all failed';
      toast.error(msg);
    }
  },

  unstageAll: async (workspaceId: string) => {
    try {
      await gitService.unstageFiles(workspaceId, ['.']);
      await get().fetchStatus(workspaceId);
      toast.success('Unstaged all changes');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unstage all failed';
      toast.error(msg);
    }
  },

  commit: async (workspaceId: string, message: string) => {
    try {
      const hash = await gitService.commit(workspaceId, message);
      await get().fetchStatus(workspaceId);
      await get().loadCommitHistory(workspaceId);
      toast.success(`Committed [${hash.substring(0, 7)}]`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Commit failed';
      toast.error(msg);
    }
  },

  push: async (workspaceId: string) => {
    try {
      toast.loading('Pushing changes to remote...', { id: 'git-push' });
      await gitService.push(workspaceId);
      await get().fetchStatus(workspaceId);
      toast.success('Pushed changes to remote!', { id: 'git-push' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Push failed';
      toast.error(msg, { id: 'git-push' });
    }
  },

  pull: async (workspaceId: string) => {
    try {
      toast.loading('Pulling latest changes from remote...', { id: 'git-pull' });
      await gitService.pull(workspaceId);
      await get().fetchStatus(workspaceId);
      toast.success('Pulled latest changes!', { id: 'git-pull' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Pull failed';
      toast.error(msg, { id: 'git-pull' });
    }
  },

  fetchRemote: async (workspaceId: string) => {
    try {
      toast.loading('Fetching remote updates...', { id: 'git-fetch' });
      await gitService.fetchRemote(workspaceId);
      await get().fetchStatus(workspaceId);
      toast.success('Fetched remote updates!', { id: 'git-fetch' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      toast.error(msg, { id: 'git-fetch' });
    }
  },

  fetchBranches: async (workspaceId: string) => {
    try {
      const branches = await gitService.getBranches(workspaceId);
      set({ branches });
    } catch {
      set({ branches: [{ name: 'main', current: true, commitHash: 'head' }] });
    }
  },

  createBranch: async (workspaceId: string, branchName: string) => {
    try {
      await gitService.createBranch(workspaceId, branchName);
      await get().fetchBranches(workspaceId);
      await get().fetchStatus(workspaceId);
      toast.success(`Created & checked out branch '${branchName}'`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Create branch failed';
      toast.error(msg);
    }
  },

  checkoutBranch: async (workspaceId: string, branchName: string) => {
    try {
      await gitService.checkoutBranch(workspaceId, branchName);
      await get().fetchBranches(workspaceId);
      await get().fetchStatus(workspaceId);
      toast.success(`Switched to branch '${branchName}'`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast.error(msg);
    }
  },

  deleteBranch: async (workspaceId: string, branchName: string) => {
    try {
      await gitService.deleteBranch(workspaceId, branchName);
      await get().fetchBranches(workspaceId);
      toast.success(`Deleted branch '${branchName}'`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete branch failed';
      toast.error(msg);
    }
  },

  loadCommitHistory: async (workspaceId: string) => {
    try {
      const commits = await gitService.getHistory(workspaceId);
      set({ commits });
    } catch {
      set({ commits: [] });
    }
  },

  loadDiff: async (workspaceId: string, filePath: string) => {
    try {
      const diff = await gitService.getDiff(workspaceId, filePath);
      set({ activeDiff: diff, showDiffModal: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load diff';
      toast.error(msg);
    }
  },

  closeDiffModal: () => set({ showDiffModal: false, activeDiff: null }),

  discardChanges: async (workspaceId: string, filePath: string) => {
    try {
      await gitService.discardChanges(workspaceId, filePath);
      await get().fetchStatus(workspaceId);
      toast.success(`Discarded changes for ${filePath.split('/').pop()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Discard failed';
      toast.error(msg);
    }
  },
}));
