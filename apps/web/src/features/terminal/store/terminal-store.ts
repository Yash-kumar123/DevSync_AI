import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { TerminalTab, RunCodePayload } from '../types/terminal.types';
import { terminalService } from '../services/terminal.service';

interface TerminalStoreState {
  tabs: TerminalTab[];
  activeTabId: string;
  bottomPanelOpen: boolean;
  isMaximized: boolean;
  panelHeight: number;

  createTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  clearTerminal: () => void;
  killTerminal: (workspaceId?: string) => Promise<void>;
  runCode: (payload: RunCodePayload) => Promise<void>;
  toggleBottomPanel: () => void;
  setBottomPanelOpen: (open: boolean) => void;
  toggleMaximize: () => void;
  setPanelHeight: (height: number) => void;
}

const initialTab: TerminalTab = {
  id: 'term-1',
  title: 'Terminal 1',
  content:
    'Welcome to DevSync AI Interactive Terminal & Sandbox Execution Environment.\nClick "Run Code" or press Ctrl+Enter to execute.\n\n$ ',
  status: 'idle',
};

export const useTerminalStore = create<TerminalStoreState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: 'term-1',
  bottomPanelOpen: false,
  isMaximized: false,
  panelHeight: 240,

  createTab: () => {
    const { tabs } = get();
    const newId = `term-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      title: `Terminal ${tabs.length + 1}`,
      content: 'DevSync AI Terminal Session Ready.\n$ ',
      status: 'idle',
    };
    set({ tabs: [...tabs, newTab], activeTabId: newId, bottomPanelOpen: true });
  },

  closeTab: (id: string) => {
    const { tabs, activeTabId } = get();
    if (tabs.length === 1) {
      set({ bottomPanelOpen: false });
      return;
    }

    const filtered = tabs.filter((t) => t.id !== id);
    const nextActive = activeTabId === id ? filtered[filtered.length - 1]?.id || '' : activeTabId;
    set({ tabs: filtered, activeTabId: nextActive });
  },

  setActiveTab: (id: string) => set({ activeTabId: id, bottomPanelOpen: true }),

  clearTerminal: () => {
    const { tabs, activeTabId } = get();
    set({
      tabs: tabs.map((t) => (t.id === activeTabId ? { ...t, content: '$ ' } : t)),
    });
  },

  killTerminal: async (workspaceId: string = 'default-workspace') => {
    const { tabs, activeTabId } = get();
    try {
      await terminalService.killCode(workspaceId);
      set({
        tabs: tabs.map((t) =>
          t.id === activeTabId
            ? { ...t, status: 'killed', content: t.content + '\n[PROCESS KILLED BY USER]\n$ ' }
            : t,
        ),
      });
      toast('Execution killed', { icon: '🛑' });
    } catch {
      toast.error('Failed to kill execution');
    }
  },

  runCode: async (payload: RunCodePayload) => {
    const { tabs, activeTabId } = get();
    set({
      bottomPanelOpen: true,
      tabs: tabs.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              status: 'running',
              content:
                t.content +
                `\n$ devsync-runner --lang=${payload.language} ${payload.fileName}\n[RUNNING...] Compiling & executing inside Docker sandbox...\n`,
            }
          : t,
      ),
    });

    try {
      const result = await terminalService.runCode(payload);

      set({
        tabs: get().tabs.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                status: result.status,
                exitCode: result.exitCode,
                durationMs: result.durationMs,
                content:
                  t.content +
                  (result.output ? `${result.output}\n` : '') +
                  `[COMPLETED] Exit Code: ${result.exitCode} (${result.durationMs}ms)\n$ `,
              }
            : t,
        ),
      });

      if (result.status === 'completed') {
        toast.success(`Execution completed in ${result.durationMs}ms!`);
      } else {
        toast.error(`Execution failed with exit code ${result.exitCode}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      set({
        tabs: get().tabs.map((t) =>
          t.id === activeTabId
            ? { ...t, status: 'failed', content: t.content + `\n[ERROR] ${message}\n$ ` }
            : t,
        ),
      });
      toast.error(message);
    }
  },

  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  setBottomPanelOpen: (open: boolean) => set({ bottomPanelOpen: open }),
  toggleMaximize: () => set((state) => ({ isMaximized: !state.isMaximized })),
  setPanelHeight: (panelHeight: number) => set({ panelHeight }),
}));
