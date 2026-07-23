import React from 'react';
import { FiRadio, FiCode, FiLayers } from 'react-icons/fi';
import { useIDEStore } from '../store/ide-store';

interface IDEStatusBarProps {
  roomCode?: string | undefined;
}

/** Format language string to clean title format. */
function formatLanguage(fileId: string | null): string {
  if (!fileId) return 'Plain Text';
  if (fileId.endsWith('.tsx')) return 'TypeScript React';
  if (fileId.endsWith('.ts')) return 'TypeScript';
  if (fileId.endsWith('.jsx')) return 'JavaScript React';
  if (fileId.endsWith('.js')) return 'JavaScript';
  if (fileId.endsWith('.json')) return 'JSON';
  if (fileId.endsWith('.css')) return 'CSS';
  if (fileId.endsWith('.md')) return 'Markdown';
  if (fileId.endsWith('.html')) return 'HTML';
  return 'Plain Text';
}

export const IDEStatusBar: React.FC<IDEStatusBarProps> = ({ roomCode = 'DEMO-ROOM' }) => {
  const { activeFileId, cursorPosition, editorSettings } = useIDEStore();

  const language = formatLanguage(activeFileId);

  return (
    <footer className="h-6 border-t border-slate-800 bg-slate-900 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-30">
      {/* Left side: Connection status & Workspace Name */}
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <FiRadio className="h-3 w-3 animate-pulse" />
          <span>Online</span>
        </div>

        {/* Workspace Name */}
        <div className="hidden sm:flex items-center gap-1 text-slate-400">
          <FiLayers className="h-3 w-3 text-indigo-400" />
          <span>{roomCode.toUpperCase()}</span>
        </div>
      </div>

      {/* Right side: Cursor Position, Encoding, Current Language */}
      <div className="flex items-center gap-4">
        {/* Cursor Position */}
        <div className="hover:text-slate-200 transition-colors">
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        </div>

        {/* Encoding */}
        <div className="hidden md:block hover:text-slate-200 transition-colors">
          <span>UTF-8</span>
        </div>

        {/* Read-Only Status if enabled */}
        {editorSettings.readOnly && (
          <div className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold text-[10px]">
            READ-ONLY
          </div>
        )}

        {/* Language */}
        <div className="flex items-center gap-1 text-indigo-300 font-medium hover:text-white transition-colors">
          <FiCode className="h-3 w-3 text-sky-400" />
          <span>{language}</span>
        </div>
      </div>
    </footer>
  );
};
