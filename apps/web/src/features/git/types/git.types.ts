// =============================================================================
// DevSync AI — Frontend Git Types
// =============================================================================

export type GitFileStatus = 'M' | 'A' | 'D' | 'R' | 'U' | '?';

export interface GitFileChange {
  path: string;
  status: GitFileStatus;
  staged: boolean;
}

export interface GitStatus {
  currentBranch: string;
  isClean: boolean;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  ahead: number;
  behind: number;
}

export interface GitBranch {
  name: string;
  current: boolean;
  commitHash: string;
}

export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
}

export interface GitDiff {
  filePath: string;
  diff: string;
}
