import React from 'react';
import { useIDEStore } from '../store/ide-store';
import { VSCodeExplorer } from '../../filesystem/components/VSCodeExplorer';

interface IDEExplorerProps {
  roomCode?: string | undefined;
}

export const IDEExplorer: React.FC<IDEExplorerProps> = ({ roomCode = 'DEV-SYNC-ROOM' }) => {
  const { leftSidebarOpen, toggleLeftSidebar } = useIDEStore();

  if (!leftSidebarOpen) return null;

  return (
    <>
      {/* Translucent mobile backdrop shadow to dismiss sidebar drawer on tap */}
      <div
        onClick={toggleLeftSidebar}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-20 md:hidden animate-in fade-in duration-150"
      />

      <aside
        className="absolute md:relative inset-y-0 left-0 w-72 sm:w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col shrink-0 select-none overflow-hidden z-30 md:z-10 shadow-2xl md:shadow-none"
        id="ide-explorer-sidebar"
      >
        <VSCodeExplorer workspaceId={roomCode} workspaceName={`EXPLORER: ${roomCode}`} />
      </aside>
    </>
  );
};
