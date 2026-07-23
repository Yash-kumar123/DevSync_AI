// =============================================================================
// DevSync AI — Git Feature DTOs & Types
// =============================================================================

export type GitFileStatus = 'M' | 'A' | 'D' | 'R' | 'U' | '?';

export interface GitFileChange {
  path: string;
  status: GitFileStatus;
  staged: boolean;
}

export interface GitStatusResponse {
  currentBranch: string;
  isClean: boolean;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  ahead: number;
  behind: number;
}

export interface GitBranchInfo {
  name: string;
  current: boolean;
  commitHash: string;
}

export interface GitCommitInfo {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
}

export interface GitDiffResponse {
  filePath: string;
  diff: string;
}

export interface StageFilesDTO {
  workspaceId: string;
  filePaths: string[];
}

export interface CommitDTO {
  workspaceId: string;
  message: string;
}

export interface BranchDTO {
  workspaceId: string;
  branchName: string;
}
