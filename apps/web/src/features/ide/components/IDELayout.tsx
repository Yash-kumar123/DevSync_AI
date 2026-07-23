import React from 'react';
import { IDETopNav } from './IDETopNav';
import { IDEExplorer } from './IDEExplorer';
import { IDEEditorContainer } from './IDEEditorContainer';
import { IDERightPanel } from './IDERightPanel';
import { IDEStatusBar } from './IDEStatusBar';
import { TerminalPanel } from '../../terminal/components/TerminalPanel';

interface IDELayoutProps {
  roomCode?: string | undefined;
}

export const IDELayout: React.FC<IDELayoutProps> = ({ roomCode }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
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
