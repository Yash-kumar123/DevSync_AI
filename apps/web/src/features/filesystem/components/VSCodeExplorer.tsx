import React, { useEffect, useState } from 'react';
import {
  FiFilePlus,
  FiFolderPlus,
  FiMinusSquare,
  FiRefreshCw,
  FiFolder,
  FiLayers,
  FiX,
  FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useFileSystemStore } from '../store/filesystem-store';
import { socketClient } from '../../collaboration/services/socket-client';
import { ExplorerTreeItem } from './ExplorerTreeItem';
import { ExplorerContextMenu } from './ExplorerContextMenu';

interface VSCodeExplorerProps {
  workspaceId: string;
  workspaceName?: string | undefined;
}

export const VSCodeExplorer: React.FC<VSCodeExplorerProps> = ({
  workspaceId,
  workspaceName = 'PROJECT EXPLORER',
}) => {
  const {
    tree,
    files,
    isLoading,
    fetchWorkspaceFileSystem,
    setCreatingNode,
    creatingNode,
    createFile,
    createFolder,
    collapseAllFolders,
    setContextMenu,
    selectedFolderId,
  } = useFileSystemStore();

  const [rootCreateValue, setRootCreateValue] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleGenerateTemplate = async (type: 'react' | 'python' | 'node' | 'cpp' | 'go') => {
    setIsTemplateModalOpen(false);

    if (type === 'react') {
      await createFile(
        'App.tsx',
        null,
        `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-8 text-center bg-slate-900 text-white min-h-screen">\n      <h1 className="text-3xl font-bold text-indigo-400">DevSync AI React App</h1>\n      <p className="mt-2 text-slate-400">Click button below to increment count</p>\n      <button\n        onClick={() => setCount(c => c + 1)}\n        className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-500"\n      >\n        Count: {count}\n      </button>\n    </div>\n  );\n}`,
      );
    } else if (type === 'python') {
      await createFile(
        'main.py',
        null,
        `from fastapi import FastAPI\n\napp = FastAPI(title="DevSync AI Service")\n\n@app.get("/")\ndef read_root():\n    return {"message": "Welcome to DevSync AI Python Service!", "status": "online"}\n\n@app.get("/items/{item_id}")\ndef read_item(item_id: int, q: str = None):\n    return {"item_id": item_id, "query": q}\n`,
      );
    } else if (type === 'node') {
      await createFile(
        'server.js',
        null,
        `const express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'DevSync AI Express API Server', timestamp: new Date() });\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server running on http://localhost:\${PORT}\`);\n});\n`,
      );
    } else if (type === 'cpp') {
      await createFile(
        'main.cpp',
        null,
        `#include <iostream>\n#include <vector>\n#include <string>\n\nint main() {\n    std::cout << "DevSync AI High-Performance C++ Application" << std::endl;\n    std::vector<std::string> features = {"Real-time CRDT", "Socket.io Sync", "AI Copilot"};\n    for (const auto& f : features) {\n        std::cout << " - Feature: " << f << std::endl;\n    }\n    return 0;\n}\n`,
      );
    } else if (type === 'go') {
      await createFile(
        'main.go',
        null,
        `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprintf(w, "Hello from DevSync AI Go Microservice!")\n}\n\nfunc main() {\n\thttp.HandleFunc("/", handler)\n\tfmt.Println("Server starting on :8080...")\n\thttp.ListenAndServe(":8080", nil)\n}\n`,
      );
    }
    toast.success(`Starter template generated!`, { icon: '🚀' });
  };

  useEffect(() => {
    if (workspaceId) {
      void fetchWorkspaceFileSystem(workspaceId);
    }

    // Automatically sync workspace file tree when peers create, edit, or delete files
    const unsubscribe = socketClient.onFileChanged(() => {
      if (workspaceId) {
        void fetchWorkspaceFileSystem(workspaceId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [workspaceId, fetchWorkspaceFileSystem]);

  const handleNewFile = () => {
    setCreatingNode({ type: 'file', parentId: selectedFolderId });
  };

  const handleNewFolder = () => {
    setCreatingNode({ type: 'folder', parentId: selectedFolderId });
  };

  const handleRootCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCreateValue.trim() || !creatingNode) {
      setCreatingNode(null);
      return;
    }
    if (creatingNode.type === 'file') {
      void createFile(rootCreateValue.trim(), null);
    } else {
      void createFolder(rootCreateValue.trim(), null);
    }
    setRootCreateValue('');
  };

  const handleContextMenuRoot = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'root',
      targetId: null,
      parentId: null,
    });
  };

  return (
    <div
      onContextMenu={handleContextMenuRoot}
      className="h-full flex flex-col bg-slate-900/90 text-slate-300 select-none overflow-hidden relative"
      id="vscode-project-explorer"
    >
      {/* Explorer Toolbar Header */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
          {workspaceName}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="New File"
            id="explorer-new-file-btn"
          >
            <FiFilePlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleNewFolder}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="New Folder"
            id="explorer-new-folder-btn"
          >
            <FiFolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="p-1 rounded text-indigo-400 hover:text-indigo-200 hover:bg-slate-800 transition-colors"
            title="1-Click Starter Project Templates"
            id="explorer-template-btn"
          >
            <FiLayers className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={collapseAllFolders}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Collapse All Folders"
            id="explorer-collapse-all-btn"
          >
            <FiMinusSquare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => void fetchWorkspaceFileSystem(workspaceId)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Refresh Explorer"
            id="explorer-refresh-btn"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Root inline creation prompt */}
        {creatingNode && creatingNode.parentId === null && (
          <div className="px-3 py-1">
            <form onSubmit={handleRootCreateSubmit}>
              <input
                type="text"
                placeholder={creatingNode.type === 'file' ? 'filename.ts' : 'foldername'}
                value={rootCreateValue}
                onChange={(e) => setRootCreateValue(e.target.value)}
                onBlur={handleRootCreateSubmit}
                autoFocus
                className="w-full bg-slate-950 text-slate-100 px-1 py-0.5 rounded border border-indigo-500 focus:outline-none font-mono text-xs"
              />
            </form>
          </div>
        )}

        {/* Tree Item List */}
        {tree.length > 0 ? (
          tree.map((node) => <ExplorerTreeItem key={node.id} node={node} />)
        ) : files.length === 0 && !isLoading ? (
          /* VS Code Empty Workspace State */
          <div className="p-4 flex flex-col items-center justify-center text-center text-slate-500 h-64">
            <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-3">
              <FiFolder className="h-6 w-6 text-indigo-400" />
            </div>
            <h4 className="text-xs font-semibold text-slate-300 mb-1">No Files in Workspace</h4>
            <p className="text-[11px] text-slate-500 mb-4 max-w-[180px]">
              Create files or load starter templates to begin.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[160px]">
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm transition-all"
              >
                <FiZap className="h-3.5 w-3.5 text-amber-300" />
                <span>Starter Templates</span>
              </button>
              <button
                onClick={handleNewFile}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <FiFilePlus className="h-3.5 w-3.5" />
                <span>New File</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Floating Context Menu Overlay */}
      <ExplorerContextMenu />

      {/* Starter Templates Picker Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <FiX className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <FiLayers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Starter Project Templates</h3>
                <p className="text-xs text-slate-400">Generate clean 1-click starter codebases</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => void handleGenerateTemplate('react')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚛️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400">
                      React + TypeScript App
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Interactive App.tsx component with state & JSX
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Use →
                </span>
              </button>

              <button
                onClick={() => void handleGenerateTemplate('python')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🐍</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400">
                      Python FastAPI Backend
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Async REST API endpoints & route handlers
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  Use →
                </span>
              </button>

              <button
                onClick={() => void handleGenerateTemplate('node')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚀</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400">
                      Node.js Express Server
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Express API server with JSON middleware
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  Use →
                </span>
              </button>

              <button
                onClick={() => void handleGenerateTemplate('cpp')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-400">
                      C++ High Performance Loop
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Modern C++17 vectors & main entry point
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  Use →
                </span>
              </button>

              <button
                onClick={() => void handleGenerateTemplate('go')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🐹</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400">
                      Go HTTP Microservice
                    </h4>
                    <p className="text-[10px] text-slate-400">Concurrent net/http web service</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  Use →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
