import React from 'react';
import {
  FiTerminal,
  FiPlus,
  FiX,
  FiPlay,
  FiTrash2,
  FiStopCircle,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi';
import { useTerminalStore } from '../store/terminal-store';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';
import { ExecutionStatusBadge } from './ExecutionStatusBadge';

export const TerminalTabsHeader: React.FC = () => {
  const {
    tabs,
    activeTabId,
    createTab,
    closeTab,
    setActiveTab,
    clearTerminal,
    killTerminal,
    runCode,
    isMaximized,
    toggleMaximize,
    toggleBottomPanel,
  } = useTerminalStore();

  const { activeFileId, files } = useFileSystemStore();
  const activeFile = activeFileId ? files.find((f) => f.id === activeFileId) || null : null;
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleRunActiveFile = () => {
    if (!activeFile) {
      void runCode({
        workspaceId: 'default-workspace',
        fileName: 'main.js',
        language: 'javascript',
        code: 'console.log("Hello from DevSync AI Terminal!");',
      });
      return;
    }

    void runCode({
      workspaceId: activeFile.workspaceId || 'default-workspace',
      fileName: activeFile.fileName,
      language: activeFile.extension.replace(/^\./, '') || 'javascript',
      code: activeFile.content,
    });
  };

  return (
    <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between select-none text-xs">
      {/* Left: Tab List */}
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-7 px-3 rounded-t-lg flex items-center gap-2 font-mono text-xs cursor-pointer transition-colors border-t border-x ${
                isActive
                  ? 'bg-[#090d16] text-slate-200 border-slate-700 border-b-transparent'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FiTerminal
                className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}
              />
              <span className="truncate max-w-[120px]">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="p-0.5 rounded hover:bg-slate-800 hover:text-red-400 text-slate-500 transition-colors"
                title="Close Tab"
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={createTab}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="New Terminal Tab"
          id="terminal-new-tab-btn"
        >
          <FiPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right: Actions Bar */}
      <div className="flex items-center gap-2 shrink-0">
        {activeTab && (
          <ExecutionStatusBadge
            status={activeTab.status}
            exitCode={activeTab.exitCode}
            durationMs={activeTab.durationMs}
          />
        )}

        {activeFile && (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            {activeFile.fileName}
          </span>
        )}

        {/* Run Code Button */}
        <button
          onClick={handleRunActiveFile}
          disabled={activeTab?.status === 'running'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
            activeTab?.status === 'running'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-sm'
          }`}
          title="Run Code (Ctrl+Enter)"
          id="terminal-run-code-btn"
        >
          <FiPlay className="h-3.5 w-3.5" />
          <span>Run</span>
        </button>

        <button
          onClick={() => void killTerminal()}
          disabled={activeTab?.status !== 'running'}
          className={`p-1.5 rounded-lg transition-colors ${
            activeTab?.status === 'running'
              ? 'text-red-400 hover:bg-red-500/20'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Kill Execution Process"
          id="terminal-kill-btn"
        >
          <FiStopCircle className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={clearTerminal}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Clear Terminal Output"
          id="terminal-clear-btn"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={toggleMaximize}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title={isMaximized ? 'Restore Panel' : 'Maximize Panel'}
          id="terminal-maximize-btn"
        >
          {isMaximized ? (
            <FiMinimize2 className="h-3.5 w-3.5" />
          ) : (
            <FiMaximize2 className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          onClick={toggleBottomPanel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Hide Terminal Panel"
          id="terminal-close-panel-btn"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
