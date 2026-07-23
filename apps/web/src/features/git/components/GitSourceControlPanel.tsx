import React, { useEffect } from 'react';
import { useGitStore } from '../store/git-store';
import { GitBranchSelector } from './GitBranchSelector';
import { GitCommitBox } from './GitCommitBox';
import { GitChangesList } from './GitChangesList';
import { GitHistoryView } from './GitHistoryView';
import { GitDiffViewer } from './GitDiffViewer';

interface GitSourceControlPanelProps {
  workspaceId?: string;
}

export const GitSourceControlPanel: React.FC<GitSourceControlPanelProps> = ({
  workspaceId = 'default-workspace',
}) => {
  const { fetchStatus, fetchBranches } = useGitStore();

  useEffect(() => {
    if (workspaceId) {
      void fetchStatus(workspaceId);
      void fetchBranches(workspaceId);
    }
  }, [workspaceId, fetchStatus, fetchBranches]);

  return (
    <div
      className="h-full flex flex-col bg-slate-900/95 text-slate-300 select-none overflow-hidden"
      id="git-source-control-panel"
    >
      {/* Branch Selector Header */}
      <GitBranchSelector workspaceId={workspaceId} />

      {/* Commit Input Box */}
      <GitCommitBox workspaceId={workspaceId} />

      {/* Staged & Unstaged Changes List */}
      <GitChangesList workspaceId={workspaceId} />

      {/* Commit History Log View */}
      <GitHistoryView workspaceId={workspaceId} />

      {/* Git Diff Overlay */}
      <GitDiffViewer />
    </div>
  );
};
