import React, { useState } from 'react';
import { FiShield, FiZap, FiCheckCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import type { CriticAudit } from '../types/multi-agent.types';

interface CriticReviewCardProps {
  audit: CriticAudit;
}

export const CriticReviewCard: React.FC<CriticReviewCardProps> = ({ audit }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-2 rounded-xl border border-emerald-500/30 bg-slate-950/80 overflow-hidden text-xs shadow-md select-none">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <FiChevronDown className="h-3.5 w-3.5" />
          ) : (
            <FiChevronRight className="h-3.5 w-3.5" />
          )}
          <FiShield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Critic Agent Security & Syntax Audit</span>
        </div>

        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
          AUDIT PASSED
        </span>
      </button>

      {/* Expanded Audit Insights */}
      {isOpen && (
        <div className="p-3 space-y-2 text-[11px] font-sans text-slate-300 bg-slate-900/90">
          <div className="flex items-start gap-2 text-emerald-400">
            <FiShield className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Security Check: </span>
              <span>{audit.security_status}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-amber-400">
            <FiZap className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Performance Check: </span>
              <span>{audit.performance_status}</span>
            </div>
          </div>

          {audit.improvements_applied && audit.improvements_applied.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="font-semibold text-indigo-400 block mb-1">
                Improvements Applied by Critic:
              </span>
              {audit.improvements_applied.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]"
                >
                  <FiCheckCircle className="h-3 w-3 text-indigo-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
