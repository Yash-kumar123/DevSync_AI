// =============================================================================
// DevSync AI — IDE Workspace Types
// =============================================================================

export interface FileNode {
  id: string; // e.g. "src/components/Button.tsx"
  name: string; // e.g. "Button.tsx"
  path: string; // e.g. "src/components/Button.tsx"
  isFolder: boolean;
  children?: FileNode[];
  language?: string; // e.g. "typescript", "javascript", "json", "markdown", "css"
  content?: string;
}

export type RightPanelTab = 'ai' | 'collaboration' | 'git' | 'terminal';

export interface EditorSettings {
  theme: 'vs-dark' | 'light';
  fontSize: number;
  minimap: boolean;
  wordWrap: 'on' | 'off';
  readOnly: boolean;
  lineNumbers: 'on' | 'off';
}

export interface CursorPosition {
  line: number;
  column: number;
  selectionHead?: { lineNumber: number; column: number } | undefined;
}
