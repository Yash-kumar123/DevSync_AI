import React, { useRef, useCallback } from 'react';
import { useTerminalStore } from '../store/terminal-store';
import { TerminalTabsHeader } from './TerminalTabsHeader';
import { XTermContainer } from './XTermContainer';

export const TerminalPanel: React.FC = () => {
  const { tabs, activeTabId, bottomPanelOpen, isMaximized, panelHeight, setPanelHeight } =
    useTerminalStore();

  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const startY = e.clientY;
      const startHeight = panelHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaY = startY - moveEvent.clientY;
        const newHeight = Math.min(Math.max(120, startHeight + deltaY), window.innerHeight - 100);
        setPanelHeight(newHeight);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [panelHeight, setPanelHeight],
  );

  if (!bottomPanelOpen) return null;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div
      className={`bg-[#090d16] flex flex-col overflow-hidden z-30 select-none ${
        isMaximized ? 'fixed inset-0 top-12 z-40' : 'w-full shrink-0 border-t border-slate-800'
      }`}
      style={!isMaximized ? { height: `${panelHeight}px` } : undefined}
      id="terminal-panel-wrapper"
    >
      {/* Draggable Top Resize Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDown}
          className="h-1.5 w-full bg-slate-800/80 hover:bg-indigo-500 cursor-row-resize transition-colors z-40 flex items-center justify-center group"
          title="Drag up/down to resize terminal height"
          id="terminal-resize-handle"
        >
          <div className="w-8 h-1 rounded-full bg-slate-600 group-hover:bg-white transition-colors" />
        </div>
      )}

      {/* Header bar */}
      <TerminalTabsHeader />

      {/* Terminal View Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab && <XTermContainer content={activeTab.content} />}
      </div>
    </div>
  );
};
