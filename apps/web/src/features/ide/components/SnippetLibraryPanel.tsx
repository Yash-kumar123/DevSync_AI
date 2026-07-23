import React, { useState } from 'react';
import { FiBookmark, FiCopy, FiCode, FiSearch, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';

interface CodeSnippet {
  id: string;
  title: string;
  category: string;
  language: string;
  code: string;
}

const PRESET_SNIPPETS: CodeSnippet[] = [
  {
    id: 'snip-1',
    title: 'React Custom Hook (useFetch)',
    category: 'React',
    language: 'typescript',
    code: `import { useState, useEffect } from 'react';\n\nexport function useFetch<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(json => { setData(json); setLoading(false); });\n  }, [url]);\n\n  return { data, loading };\n}`,
  },
  {
    id: 'snip-2',
    title: 'FastAPI CORS & Auth Middleware',
    category: 'Python',
    language: 'python',
    code: `from fastapi import FastAPI, Depends, HTTPException, status\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp = FastAPI()\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)`,
  },
  {
    id: 'snip-3',
    title: 'Express JWT Authorization Route',
    category: 'Node.js',
    language: 'javascript',
    code: `const jwt = require('jsonwebtoken');\n\nfunction authenticateToken(req, res, next) {\n  const authHeader = req.headers['authorization'];\n  const token = authHeader && authHeader.split(' ')[1];\n  if (!token) return res.sendStatus(401);\n  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {\n    if (err) return res.sendStatus(403);\n    req.user = user;\n    next();\n  });\n}`,
  },
  {
    id: 'snip-4',
    title: 'Tailwind Glassmorphic Card',
    category: 'CSS',
    language: 'css',
    code: `.glass-card {\n  background: rgba(15, 23, 42, 0.75);\n  backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 1rem;\n  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);\n}`,
  },
];

export const SnippetLibraryPanel: React.FC = () => {
  const { activeFileId, openFiles, updateFileContentLocally } = useFileSystemStore();
  const [snippets] = useState<CodeSnippet[]>(PRESET_SNIPPETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInsertSnippet = (snippet: CodeSnippet) => {
    const activeFile = openFiles.find((f) => f.id === activeFileId);
    if (!activeFile) {
      void navigator.clipboard.writeText(snippet.code);
      toast.success(`Copied "${snippet.title}" to clipboard!`, { icon: '📋' });
      return;
    }

    const updatedContent = `${activeFile.content}\n\n// ── ${snippet.title} ──\n${snippet.code}`;
    updateFileContentLocally(activeFile.id, updatedContent);
    toast.success(`Inserted "${snippet.title}" into ${activeFile.fileName}!`, { icon: '✨' });
  };

  const handleCopy = (snippet: CodeSnippet) => {
    void navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    toast.success('Snippet copied to clipboard!', { icon: '📑' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950/90 text-slate-200 select-none p-3 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <FiBookmark className="h-4 w-4 text-indigo-400" />
          <span className="font-bold text-xs text-white">Code Snippets & Bookmarks</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{filtered.length} Saved</span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search snippets by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Snippet Card List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        {filtered.map((snip) => (
          <div
            key={snip.id}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                {snip.title}
              </span>
              <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                {snip.category}
              </span>
            </div>

            <pre className="text-[10px] font-mono bg-slate-950 p-2 rounded-lg text-slate-400 overflow-x-auto max-h-24 leading-relaxed border border-slate-900">
              {snip.code}
            </pre>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => handleCopy(snip)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copiedId === snip.id ? (
                  <FiCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <FiCopy className="h-3 w-3" />
                )}
                <span>{copiedId === snip.id ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleInsertSnippet(snip)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-glow-sm"
              >
                <FiCode className="h-3 w-3" />
                <span>Insert in Editor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
