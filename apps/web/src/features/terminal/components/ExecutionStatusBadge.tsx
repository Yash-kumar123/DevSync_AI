import React from 'react';
import { FiPlay, FiCheckCircle, FiXCircle, FiStopCircle } from 'react-icons/fi';
import type { ExecutionStatus } from '../types/terminal.types';

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
  exitCode?: number | undefined;
  durationMs?: number | undefined;
}

export const ExecutionStatusBadge: React.FC<ExecutionStatusBadgeProps> = ({
  status,
  exitCode,
  durationMs,
}) => {
  if (status === 'idle') return null;

  if (status === 'running') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
        <FiPlay className="h-3 w-3 animate-spin" />
        <span>RUNNING...</span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <FiCheckCircle className="h-3 w-3" />
        <span>SUCCESS ({durationMs ?? 0}ms)</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
        <FiXCircle className="h-3 w-3" />
        <span>EXIT CODE: {exitCode ?? 1}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
      <FiStopCircle className="h-3 w-3" />
      <span>KILLED</span>
    </div>
  );
};
