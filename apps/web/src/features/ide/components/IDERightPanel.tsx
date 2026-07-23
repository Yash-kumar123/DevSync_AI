import React, { useState, useRef, useCallback } from 'react';
import { FiCpu, FiUsers, FiGitBranch, FiTerminal, FiX, FiLock } from 'react-icons/fi';
import { useIDEStore } from '../store/ide-store';
import type { RightPanelTab } from '../types/ide.types';
import { CollaborationPanelContent } from '../../collaboration/components/CollaborationPanelContent';
import { AIChatPanel } from '../../ai/components/AIChatPanel';
import { GitSourceControlPanel } from '../../git/components/GitSourceControlPanel';

export const IDERightPanel: React.FC = () => {
  const { rightPanelOpen, toggleRightPanel, activeRightTab, setActiveRightTab } = useIDEStore();

  const [panelWidth, setPanelWidth] = useState<number>(440);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const startX = e.clientX;
      const startWidth = panelWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = startX - moveEvent.clientX;
        const maxW = Math.floor(window.innerWidth * 0.65);
        const newWidth = Math.min(Math.max(340, startWidth + deltaX), maxW);
        setPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [panelWidth],
  );

  const tabs: Array<{ id: RightPanelTab; label: string; icon: React.ReactNode }> = [
    { id: 'ai', label: 'AI Assistant', icon: <FiCpu className="h-4 w-4" /> },
    { id: 'collaboration', label: 'Collaboration', icon: <FiUsers className="h-4 w-4" /> },
    { id: 'git', label: 'Git Control', icon: <FiGitBranch className="h-4 w-4" /> },
    { id: 'terminal', label: 'Terminal', icon: <FiTerminal className="h-4 w-4" /> },
  ];

  return (
    <div className="flex shrink-0 select-none z-30 md:z-20 relative" id="ide-right-panel-wrapper">
      {/* Mobile backdrop shadow to dismiss right panel on tap */}
      {rightPanelOpen && (
        <div
          onClick={toggleRightPanel}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-20 md:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Expanded Panel */}
      {rightPanelOpen && (
        <aside
          className="absolute md:relative right-11 md:right-0 inset-y-0 border-l border-slate-800 bg-slate-900/95 flex flex-col overflow-hidden shadow-2xl z-30 md:z-10 max-w-[calc(100vw-2.75rem)] transition-all duration-150"
          style={{ width: `${Math.min(panelWidth, window.innerWidth - 48)}px` }}
        >
          {/* Draggable Left Width Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute left-0 top-0 bottom-0 w-1.5 hover:bg-indigo-500/80 cursor-col-resize transition-colors z-40 group"
            title="Drag left/right to resize AI Assistant width"
            id="right-panel-resize-handle"
          />
          {/* Header */}
          <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 bg-slate-950/40">
            <span className="uppercase tracking-wider">
              {tabs.find((t) => t.id === activeRightTab)?.label}
            </span>
            <button
              onClick={toggleRightPanel}
              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {activeRightTab === 'ai' ? (
              <AIChatPanel />
            ) : activeRightTab === 'collaboration' ? (
              <CollaborationPanelContent />
            ) : activeRightTab === 'git' ? (
              <GitSourceControlPanel />
            ) : (
              <div className="flex-1 p-5 flex flex-col justify-center items-center text-center">
                {activeRightTab === 'terminal' && (
                  <div className="flex flex-col items-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center mb-4">
                      <FiTerminal className="h-7 w-7 text-purple-400" />
                    </div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                      <FiLock className="h-3 w-3" />
                      Integrated Below
                    </div>
                    <h4 className="text-base font-bold text-slate-200 mt-1">Bottom Terminal</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xs">
                      The multi-tab xterm.js interactive terminal is active in the bottom panel
                      below.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Vertical Icon Activity Bar on the right */}
      <div className="w-11 border-l border-slate-800 bg-slate-950/90 flex flex-col items-center py-2 gap-3">
        {tabs.map((tab) => {
          const isActive = rightPanelOpen && activeRightTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id)}
              className={`p-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-slate-800 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
              }`}
              title={tab.label}
              id={`right-tab-${tab.id}`}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
