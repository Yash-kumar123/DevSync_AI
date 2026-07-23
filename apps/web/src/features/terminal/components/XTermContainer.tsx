import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface XTermContainerProps {
  content: string;
  onData?: (data: string) => void;
}

export const XTermContainer: React.FC<XTermContainerProps> = ({ content, onData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: 12,
      lineHeight: 1.2,
      theme: {
        background: '#090d16',
        foreground: '#cbd5e1',
        cursor: '#6366f1',
        selectionBackground: '#334155',
        black: '#000000',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#ec4899',
        cyan: '#06b6d4',
        white: '#f8fafc',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    if (onData) {
      term.onData(onData);
    }

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {
        // Ignore fit resize error
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Update content in terminal instance when content changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.write(content.replace(/\n/g, '\r\n'));
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-2 bg-[#090d16] font-mono text-xs overflow-hidden select-text"
    />
  );
};
