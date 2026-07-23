import React, { useState } from 'react';
import { FiCopy, FiCheck, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';
import { useIDEStore } from '../../ide/store/ide-store';
import type { DBFile } from '../../filesystem/types/filesystem.types';

interface MarkdownMessageProps {
  content: string;
}

interface CodeBlockPart {
  type: 'code';
  language: string;
  code: string;
}

interface TextPart {
  type: 'text';
  text: string;
}

type MessagePart = CodeBlockPart | TextPart;

/** Parse raw text into alternating text fragments and fenced code blocks. */
function parseMarkdownParts(markdown: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_+#-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: markdown.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      code: (match[2] || '').trimEnd(),
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < markdown.length) {
    parts.push({
      type: 'text',
      text: markdown.slice(lastIndex),
    });
  }

  return parts;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const parts = parseMarkdownParts(content);

  return (
    <div className="space-y-2 text-xs leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} language={part.language} code={part.code} />;
        }
        return <FormattedText key={index} text={part.text} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleApplyToFile = () => {
    try {
      const fsStore = useFileSystemStore.getState();
      if (fsStore.activeFileId) {
        fsStore.updateFileContentLocally(fsStore.activeFileId, code);
        const activeFile = fsStore.openFiles.find((f: DBFile) => f.id === fsStore.activeFileId);
        const fileName = activeFile ? activeFile.fileName : fsStore.activeFileId;
        setApplied(true);
        toast.success(`Applied code directly to active file '${fileName}'!`);
        setTimeout(() => setApplied(false), 2500);
        return;
      }
    } catch (e) {
      console.warn('FileSystem store access error', e);
    }

    try {
      const ideStore = useIDEStore.getState();
      if (ideStore.activeFileId) {
        ideStore.updateFileContent(ideStore.activeFileId, code);
        setApplied(true);
        toast.success(`Applied code to file '${ideStore.activeFileId}'!`);
        setTimeout(() => setApplied(false), 2500);
        return;
      }
    } catch (e) {
      console.warn('IDE store access error', e);
    }

    toast.error('No active file open in the editor. Open a file first.');
  };

  return (
    <div className="my-2.5 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
      {/* Code Header Bar */}
      <div className="h-8 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <span className="text-indigo-400 font-semibold uppercase">{language}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyToFile}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-colors"
            title="Apply Code to Active File in Editor"
          >
            {applied ? (
              <>
                <FiCheck className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Applied!</span>
              </>
            ) : (
              <>
                <FiZap className="h-3 w-3 text-indigo-400" />
                <span>Apply to File</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-100 transition-colors text-slate-400"
            title="Copy Code"
          >
            {copied ? (
              <>
                <FiCheck className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <FiCopy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-3 overflow-x-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-slate-200 bg-slate-950">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Simple markdown renderer for bold, inline code, and paragraphs
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, pIdx) => {
        if (!paragraph.trim()) return null;

        // Render inline bold and code
        const formatted = paragraph.split('\n').map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {renderInlineMarkdown(line)}
          </React.Fragment>
        ));

        return (
          <p key={pIdx} className="text-slate-300">
            {formatted}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineMarkdown(text: string): React.ReactNode {
  // Replace **bold** and `code`
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
