import React from 'react';
import { IDETopNav } from './IDETopNav';
import { IDEExplorer } from './IDEExplorer';
import { IDEEditorContainer } from './IDEEditorContainer';
import { IDERightPanel } from './IDERightPanel';
import { IDEStatusBar } from './IDEStatusBar';
import { TerminalPanel } from '../../terminal/components/TerminalPanel';
import { useIDEStore } from '../store/ide-store';

interface IDELayoutProps {
  roomCode?: string | undefined;
}

export const IDELayout: React.FC<IDELayoutProps> = ({ roomCode }) => {
  const { editorSettings } = useIDEStore();
  const isDark = editorSettings.theme === 'vs-dark';

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-200 ${
        isDark ? 'bg-black text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Navigation Bar */}
      <IDETopNav roomCode={roomCode} />

      {/* Main Workspace Area: Explorer | Editor | Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden relative">
          <IDEExplorer roomCode={roomCode} />
          <IDEEditorContainer />
          <IDERightPanel />
        </div>

        {/* Bottom Terminal Panel */}
        <TerminalPanel />
      </div>

      {/* Bottom Status Bar */}
      <IDEStatusBar roomCode={roomCode} />
    </div>
  );
};
