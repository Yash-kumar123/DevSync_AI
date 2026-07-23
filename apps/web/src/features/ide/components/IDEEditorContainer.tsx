import React, { useRef, useEffect } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import toast from 'react-hot-toast';
import { useIDEStore } from '../store/ide-store';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';
import { useCollaborationStore } from '../../collaboration/store/collaboration-store';
import { useAIChatStore } from '../../ai/store/ai-store';
import { socketClient } from '../../collaboration/services/socket-client';
import { YjsProviderService } from '../../collaboration/services/yjs-provider';
import { remoteCursorsManager } from '../../collaboration/components/RemoteCursorsManager';
import { IDEEditorTabs } from './IDEEditorTabs';
import { FiCode } from 'react-icons/fi';

/** Map file extension to Monaco Editor language string. */
function getMonacoLanguage(filename: string | null): string {
  if (!filename) return 'plaintext';
  const lower = filename.toLowerCase();
  if (lower.endsWith('.tsx') || lower.endsWith('.ts')) return 'typescript';
  if (lower.endsWith('.jsx') || lower.endsWith('.js')) return 'javascript';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'css';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.c') || lower.endsWith('.h')) return 'c';
  if (lower.endsWith('.cpp') || lower.endsWith('.hpp') || lower.endsWith('.cc')) return 'cpp';
  if (lower.endsWith('.java')) return 'java';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
  return 'plaintext';
}

export const IDEEditorContainer: React.FC = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const yjsProviderRef = useRef<YjsProviderService | null>(null);

  const { editorSettings, setCursorPosition } = useIDEStore();
  const { openFiles, activeFileId, updateFileContentLocally } = useFileSystemStore();
  const { users } = useCollaborationStore();

  const currentFile = openFiles.find((f) => f.id === activeFileId);
  const language = getMonacoLanguage(currentFile ? currentFile.fileName : null);

  // Initialize Yjs CRDT Provider when active file changes
  useEffect(() => {
    if (currentFile) {
      if (yjsProviderRef.current) {
        yjsProviderRef.current.destroy();
      }
      yjsProviderRef.current = new YjsProviderService(currentFile.id);
      if (editorRef.current) {
        yjsProviderRef.current.bindToEditor(editorRef.current);
      }
    }
    return () => {
      if (yjsProviderRef.current) {
        yjsProviderRef.current.destroy();
        yjsProviderRef.current = null;
      }
    };
  }, [currentFile?.id]);

  // Update remote user cursor decorations inside Monaco Editor
  useEffect(() => {
    if (editorRef.current) {
      remoteCursorsManager.updateRemoteCursors(users);
    }
  }, [users]);

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
    remoteCursorsManager.setEditor(editorInstance);

    if (yjsProviderRef.current) {
      yjsProviderRef.current.bindToEditor(editorInstance);
    }

    // Add custom Monaco Context Menu item: Ask AI to Review & Refactor Code
    editorInstance.addAction({
      id: 'devsync-ai-code-review',
      label: '✨ DevSync AI: Review & Refactor Code',
      keybindings: [],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (ed) => {
        const selection = ed.getSelection();
        const selectedText = selection ? ed.getModel()?.getValueInRange(selection) : '';
        if (selectedText && selectedText.trim()) {
          const prompt = `Please review and refactor this code snippet:\n\`\`\`${language}\n${selectedText}\n\`\`\``;
          useIDEStore.getState().setActiveRightTab('ai');
          void useAIChatStore.getState().sendMessage(prompt);
          toast.success('Sent code snippet to AI Assistant!', { icon: '✨' });
        } else {
          toast.error('Please highlight code first to review with AI.');
        }
      },
    });

    // Track cursor position and broadcast over Socket.io
    editorInstance.onDidChangeCursorPosition((e) => {
      const line = e.position.lineNumber;
      const col = e.position.column;
      setCursorPosition(line, col);

      const selection = editorInstance.getSelection();
      socketClient.emitCursorChange(
        {
          lineNumber: line,
          column: col,
          selectionHead: selection
            ? {
                lineNumber: selection.selectionStartLineNumber,
                column: selection.selectionStartColumn,
              }
            : undefined,
        },
        true,
      );
    });
  };

  const handleEditorChange: OnChange = (value) => {
    if (currentFile && value !== undefined) {
      updateFileContentLocally(currentFile.id, value);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative"
      id="ide-editor-container"
    >
      {/* Top Tabs */}
      <IDEEditorTabs />

      {/* Editor Content Area */}
      {currentFile ? (
        <div className="flex-1 relative">
          <Editor
            height="100%"
            path={currentFile.id} // Ensures Monaco maintains model caching per path/id
            language={language}
            theme={editorSettings.theme}
            value={currentFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              automaticLayout: true,
              fontSize: editorSettings.fontSize,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
              minimap: { enabled: editorSettings.minimap },
              wordWrap: editorSettings.wordWrap,
              readOnly: editorSettings.readOnly,
              lineNumbers: editorSettings.lineNumbers,
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              tabSize: 2,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
            }}
          />
        </div>
      ) : (
        /* Empty State when no tabs are open */
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center select-none">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <FiCode className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">No File Open</h3>
          <p className="text-xs text-slate-500 max-w-xs mb-4">
            Select a file from the explorer sidebar to begin editing code.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">Ctrl + B</kbd>
            <span>to toggle sidebar</span>
          </div>
        </div>
      )}
    </div>
  );
};
