import React, { useState, useRef, useEffect } from 'react';
import {
  FiCpu,
  FiSend,
  FiStopCircle,
  FiTrash2,
  FiUser,
  FiLoader,
  FiShield,
  FiTool,
  FiDatabase,
  FiZap,
} from 'react-icons/fi';
import { useAIChatStore } from '../store/ai-store';
import { MarkdownMessage } from './MarkdownMessage';
import { RAGStatusPanel } from '../../rag/components/RAGStatusPanel';
import { RAGRetrievedSourcesView } from '../../rag/components/RAGRetrievedSourcesView';
import { CriticReviewCard } from './CriticReviewCard';
import { useRAGStore } from '../../rag/store/rag-store';

interface AIChatPanelProps {
  workspaceId?: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ workspaceId = 'default-workspace' }) => {
  const {
    messages,
    isGenerating,
    streamingContent,
    agentMode,
    activeStep,
    criticAudit,
    autoApply,
    toggleAutoApply,
    setAgentMode,
    sendMessage,
    stopGeneration,
    clearHistory,
  } = useAIChatStore();

  const { clearRetrievedSources } = useRAGStore();
  const [prompt, setPrompt] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages or stream tokens arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, activeStep]);

  const handleClearAll = () => {
    clearHistory();
    clearRetrievedSources();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    void sendMessage(prompt, workspaceId);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-slate-900/95 text-slate-300 select-none overflow-hidden"
      id="ai-chat-panel"
    >
      {/* Header Bar */}
      <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
            <FiCpu className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-200 tracking-tight">DevSync AI</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            qwen2.5-coder
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleAutoApply}
            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all ${
              autoApply
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50 border border-slate-700/50'
            }`}
            title={autoApply ? 'Auto-Apply to active file ON' : 'Turn ON Auto-Apply to active file'}
          >
            <FiZap
              className={`h-3 w-3 ${autoApply ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}
            />
            <span>{autoApply ? 'Auto-Apply: ON' : 'Auto-Apply'}</span>
          </button>

          <button
            onClick={handleClearAll}
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Clear Conversation"
            id="ai-clear-history-btn"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex gap-1 text-[11px] font-medium shrink-0">
        <button
          onClick={() => setAgentMode('standard')}
          className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            agentMode === 'standard'
              ? 'bg-indigo-600 text-white shadow-glow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FiCpu className="h-3.5 w-3.5" />
          <span>Standard</span>
        </button>

        <button
          onClick={() => setAgentMode('rag')}
          className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            agentMode === 'rag'
              ? 'bg-indigo-600 text-white shadow-glow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FiDatabase className="h-3.5 w-3.5" />
          <span>Codebase RAG</span>
        </button>

        <button
          onClick={() => setAgentMode('multi-agent')}
          className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            agentMode === 'multi-agent'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FiShield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Multi-Agent</span>
        </button>
      </div>

      {/* RAG Status Panel (Show when in RAG or Multi-Agent mode) */}
      {(agentMode === 'rag' || agentMode === 'multi-agent') && (
        <RAGStatusPanel workspaceId={workspaceId} />
      )}

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Header info */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <FiUser className="h-3 w-3 text-indigo-400" />
                </>
              ) : (
                <>
                  <FiCpu className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">DevSync AI</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Content card */}
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none font-sans text-xs'
                  : 'bg-slate-950/80 border border-slate-800/80 text-slate-300 rounded-bl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <>
                  <MarkdownMessage content={msg.content} />
                  <RAGRetrievedSourcesView />
                  {criticAudit && <CriticReviewCard audit={criticAudit} />}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Multi-Agent Active Step Badges */}
        {isGenerating && agentMode === 'multi-agent' && (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <FiLoader className="h-4 w-4 animate-spin" />
              <span>LangGraph Multi-Agent Pipeline Running...</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <div
                className={`p-1.5 rounded-lg border flex items-center gap-1 ${
                  activeStep === 'retrieving_context'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <FiDatabase className="h-3 w-3 shrink-0" />
                <span className="truncate">1. RAG Context</span>
              </div>

              <div
                className={`p-1.5 rounded-lg border flex items-center gap-1 ${
                  activeStep === 'builder_agent'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <FiTool className="h-3 w-3 shrink-0" />
                <span className="truncate">2. Builder Agent</span>
              </div>

              <div
                className={`p-1.5 rounded-lg border flex items-center gap-1 ${
                  activeStep === 'critic_agent'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <FiShield className="h-3 w-3 shrink-0" />
                <span className="truncate">3. Critic Agent</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Token Streaming Preview */}
        {isGenerating && streamingContent && (
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 px-1 font-semibold">
              <FiCpu className="h-3 w-3 animate-spin" />
              <span>DevSync AI (Streaming...)</span>
            </div>
            <div className="max-w-[92%] rounded-2xl rounded-bl-none px-3.5 py-2.5 bg-slate-950/80 border border-indigo-500/30 text-slate-300 shadow-glow-sm">
              <MarkdownMessage content={streamingContent} />
              <RAGRetrievedSourcesView />
              {criticAudit && <CriticReviewCard audit={criticAudit} />}
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form & Action Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative rounded-xl border border-slate-800 bg-slate-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-2">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                agentMode === 'multi-agent'
                  ? 'Ask Multi-Agent pipeline (Builder -> Critic audit)... (Ctrl + Enter)'
                  : agentMode === 'rag'
                    ? 'Ask DevSync AI about your project codebase... (Ctrl + Enter)'
                    : 'Ask DevSync AI anything... (Ctrl + Enter)'
              }
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-sans"
              id="ai-prompt-input"
            />

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
              <span>
                Press{' '}
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl+Enter</kbd>
              </span>

              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-medium"
                  id="ai-stop-btn"
                >
                  <FiStopCircle className="h-3.5 w-3.5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                    prompt.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  id="ai-send-btn"
                >
                  <FiSend className="h-3 w-3" />
                  <span>Send</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
