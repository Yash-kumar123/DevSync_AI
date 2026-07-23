import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { AIChatMessage } from '../types/ai.types';
import type { AgentMode, MultiAgentStepName, CriticAudit } from '../types/multi-agent.types';
import { aiService } from '../services/ai.service';
import { ragService } from '../../rag/services/rag.service';
import { multiAgentService } from '../services/multi-agent.service';
import { useRAGStore } from '../../rag/store/rag-store';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';
import type { DBFile } from '../../filesystem/types/filesystem.types';

interface AIChatStoreState {
  messages: AIChatMessage[];
  isGenerating: boolean;
  streamingContent: string;
  abortController: AbortController | null;
  agentMode: AgentMode;
  activeStep: MultiAgentStepName;
  criticAudit: CriticAudit | null;
  autoApply: boolean;

  setAgentMode: (mode: AgentMode) => void;
  toggleAutoApply: () => void;
  sendMessage: (prompt: string, workspaceId?: string) => Promise<void>;
  stopGeneration: () => void;
  clearHistory: () => void;
}

export const useAIChatStore = create<AIChatStoreState>((set, get) => ({
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        '👋 Hi! I am **DevSync AI Assistant**. Select a mode above (*Standard*, *Codebase RAG*, or *Multi-Agent Pipeline*) to get started!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isGenerating: false,
  streamingContent: '',
  abortController: null,
  agentMode: 'standard',
  activeStep: 'idle',
  criticAudit: null,
  autoApply: false,

  setAgentMode: (agentMode: AgentMode) => set({ agentMode }),
  toggleAutoApply: () => set((state) => ({ autoApply: !state.autoApply })),

  sendMessage: async (prompt: string, workspaceId: string = 'default-workspace') => {
    const trimmed = prompt.trim();
    if (!trimmed || get().isGenerating) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...get().messages, userMsg];
    const controller = new AbortController();

    set({
      messages: updatedMessages,
      isGenerating: true,
      streamingContent: '',
      activeStep: 'retrieving_context',
      criticAudit: null,
      abortController: controller,
    });

    let currentBuffer = '';
    const ragStore = useRAGStore.getState();
    const mode = get().agentMode;

    const onChunk = (chunkText: string) => {
      currentBuffer += chunkText;
      set({ streamingContent: currentBuffer });
    };

    const onComplete = () => {
      const finalBuffer = get().streamingContent;
      if (finalBuffer) {
        const assistantMsg: AIChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: finalBuffer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        if (get().autoApply) {
          const codeMatch = /```(?:[a-zA-Z0-9_+#-]*)\n([\s\S]*?)```/.exec(finalBuffer);
          if (codeMatch && codeMatch[1]) {
            const code = codeMatch[1].trimEnd();
            try {
              const fsStore = useFileSystemStore.getState();
              if (fsStore.activeFileId) {
                fsStore.updateFileContentLocally(fsStore.activeFileId, code);
                const activeFile = fsStore.openFiles.find(
                  (f: DBFile) => f.id === fsStore.activeFileId,
                );
                const fileName = activeFile ? activeFile.fileName : fsStore.activeFileId;
                toast.success(
                  `⚡ Automatically applied AI code directly to active file '${fileName}'!`,
                );
              }
            } catch (e) {
              console.warn('Auto-apply file update error', e);
            }
          }
        }

        set({
          messages: [...get().messages, assistantMsg],
          streamingContent: '',
          isGenerating: false,
          activeStep: 'complete',
          abortController: null,
        });
      } else {
        set({ isGenerating: false, activeStep: 'idle', abortController: null });
      }
    };

    const onError = (err: Error) => {
      set({ isGenerating: false, activeStep: 'idle', abortController: null, streamingContent: '' });
      toast.error(err.message || 'AI generation failed');
    };

    if (mode === 'multi-agent') {
      await multiAgentService.streamPipeline(
        workspaceId,
        trimmed,
        {
          onStepChange: (stepPayload) => {
            if (stepPayload.step) {
              set({ activeStep: stepPayload.step });
            }
            if (stepPayload.critic_audit) {
              set({ criticAudit: stepPayload.critic_audit });
            }
          },
          onChunk,
          onComplete,
          onError,
        },
        controller.signal,
      );
    } else if (mode === 'rag' || (ragStore.useCodebaseContext && ragStore.status?.is_indexed)) {
      await ragService.queryRAGStream(
        workspaceId,
        trimmed,
        {
          onMetadata: (metadata) => ragStore.setQueryResult(metadata),
          onChunk,
          onComplete,
          onError,
        },
        controller.signal,
      );
    } else {
      await aiService.streamChat(
        trimmed,
        updatedMessages.slice(-10),
        {
          onChunk,
          onComplete,
          onError,
        },
        controller.signal,
      );
    }
  },

  stopGeneration: () => {
    const { abortController, streamingContent, messages } = get();
    if (abortController) {
      abortController.abort();
    }
    if (streamingContent) {
      const partialMsg: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: streamingContent + ' *(Stopped)*',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      set({
        messages: [...messages, partialMsg],
        streamingContent: '',
        isGenerating: false,
        activeStep: 'idle',
        abortController: null,
      });
    } else {
      set({ isGenerating: false, activeStep: 'idle', abortController: null });
    }
    toast('Generation stopped', { icon: '🛑' });
  },

  clearHistory: () => {
    const { stopGeneration, isGenerating } = get();
    if (isGenerating) {
      stopGeneration();
    }
    set({
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content:
            '👋 Hi! I am **DevSync AI Assistant**. Select a mode above (*Standard*, *Codebase RAG*, or *Multi-Agent Pipeline*) to get started!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      streamingContent: '',
      activeStep: 'idle',
      criticAudit: null,
    });
    toast.success('Chat history cleared');
  },
}));
