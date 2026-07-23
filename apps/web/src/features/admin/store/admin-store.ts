import { create } from 'zustand';
import type {
  DashboardStatsDTO,
  SystemHealthDTO,
  AIAnalyticsDTO,
  SystemLogDTO,
  AdminUserDTO,
  AdminWorkspaceDTO,
  AdminSettingsDTO,
  LogService,
  LogLevel,
} from '@devsync/shared-types';
import { adminApi } from '../services/admin-api';

// =============================================================================
// DevSync AI — Admin State Store (Zustand)
// Global store for Dashboard KPI Metrics, System Health, Logs Viewer, Users/Workspaces,
// AI Telemetry, and Pagination/Search Filters.
// =============================================================================

export type AdminTab =
  'overview' | 'users' | 'workspaces' | 'ai-analytics' | 'system-health' | 'logs' | 'settings';

interface AdminState {
  activeTab: AdminTab;

  stats: DashboardStatsDTO | null;
  health: SystemHealthDTO | null;
  aiAnalytics: AIAnalyticsDTO | null;
  settings: AdminSettingsDTO | null;

  // Logs table state
  logs: SystemLogDTO[];
  logsTotal: number;
  logsPage: number;
  logsTotalPages: number;
  logsSearch: string;
  logsServiceFilter: LogService | 'ALL';
  logsLevelFilter: LogLevel | 'ALL';

  // Users table state
  users: AdminUserDTO[];
  usersTotal: number;
  usersPage: number;
  usersTotalPages: number;
  usersSearch: string;
  usersRoleFilter: string | 'ALL';

  // Workspaces table state
  workspaces: AdminWorkspaceDTO[];
  workspacesTotal: number;
  workspacesPage: number;
  workspacesTotalPages: number;
  workspacesSearch: string;

  // Loading & Error states
  isLoadingStats: boolean;
  isLoadingHealth: boolean;
  isLoadingAiAnalytics: boolean;
  isLoadingLogs: boolean;
  isLoadingUsers: boolean;
  isLoadingWorkspaces: boolean;
  error: string | null;
}

interface AdminActions {
  setActiveTab: (tab: AdminTab) => void;

  // Search & Filter setters
  setLogsSearch: (search: string) => void;
  setLogsServiceFilter: (service: LogService | 'ALL') => void;
  setLogsLevelFilter: (level: LogLevel | 'ALL') => void;
  setLogsPage: (page: number) => void;

  setUsersSearch: (search: string) => void;
  setUsersRoleFilter: (role: string | 'ALL') => void;
  setUsersPage: (page: number) => void;

  setWorkspacesSearch: (search: string) => void;
  setWorkspacesPage: (page: number) => void;

  // Async API Fetch actions
  fetchDashboardStats: () => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchAIAnalytics: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const initialState: AdminState = {
  activeTab: 'overview',

  stats: null,
  health: null,
  aiAnalytics: null,
  settings: null,

  logs: [],
  logsTotal: 0,
  logsPage: 1,
  logsTotalPages: 1,
  logsSearch: '',
  logsServiceFilter: 'ALL',
  logsLevelFilter: 'ALL',

  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersTotalPages: 1,
  usersSearch: '',
  usersRoleFilter: 'ALL',

  workspaces: [],
  workspacesTotal: 0,
  workspacesPage: 1,
  workspacesTotalPages: 1,
  workspacesSearch: '',

  isLoadingStats: false,
  isLoadingHealth: false,
  isLoadingAiAnalytics: false,
  isLoadingLogs: false,
  isLoadingUsers: false,
  isLoadingWorkspaces: false,
  error: null,
};

export const useAdminStore = create<AdminState & AdminActions>()((set, get) => ({
  ...initialState,

  setActiveTab: (activeTab) => set({ activeTab }),

  // Logs filters
  setLogsSearch: (logsSearch) => {
    set({ logsSearch, logsPage: 1 });
    void get().fetchLogs();
  },
  setLogsServiceFilter: (logsServiceFilter) => {
    set({ logsServiceFilter, logsPage: 1 });
    void get().fetchLogs();
  },
  setLogsLevelFilter: (logsLevelFilter) => {
    set({ logsLevelFilter, logsPage: 1 });
    void get().fetchLogs();
  },
  setLogsPage: (logsPage) => {
    set({ logsPage });
    void get().fetchLogs();
  },

  // Users filters
  setUsersSearch: (usersSearch) => {
    set({ usersSearch, usersPage: 1 });
    void get().fetchUsers();
  },
  setUsersRoleFilter: (usersRoleFilter) => {
    set({ usersRoleFilter, usersPage: 1 });
    void get().fetchUsers();
  },
  setUsersPage: (usersPage) => {
    set({ usersPage });
    void get().fetchUsers();
  },

  // Workspaces filters
  setWorkspacesSearch: (workspacesSearch) => {
    set({ workspacesSearch, workspacesPage: 1 });
    void get().fetchWorkspaces();
  },
  setWorkspacesPage: (workspacesPage) => {
    set({ workspacesPage });
    void get().fetchWorkspaces();
  },

  // Async API Fetchers
  fetchDashboardStats: async () => {
    set({ isLoadingStats: true, error: null });
    try {
      const stats = await adminApi.getDashboardStats();
      set({ stats });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard stats';
      set({ error: msg });
    } finally {
      set({ isLoadingStats: false });
    }
  },

  fetchSystemHealth: async () => {
    set({ isLoadingHealth: true });
    try {
      const health = await adminApi.getSystemHealth();
      set({ health });
    } catch (err: unknown) {
      console.error('Failed to fetch system health:', err);
    } finally {
      set({ isLoadingHealth: false });
    }
  },

  fetchAIAnalytics: async () => {
    set({ isLoadingAiAnalytics: true });
    try {
      const aiAnalytics = await adminApi.getAIAnalytics();
      set({ aiAnalytics });
    } catch (err: unknown) {
      console.error('Failed to fetch AI analytics:', err);
    } finally {
      set({ isLoadingAiAnalytics: false });
    }
  },

  fetchLogs: async () => {
    const { logsPage, logsSearch, logsServiceFilter, logsLevelFilter } = get();
    set({ isLoadingLogs: true });
    try {
      const res = await adminApi.getLogs({
        page: logsPage,
        limit: 15,
        service: logsServiceFilter === 'ALL' ? undefined : logsServiceFilter,
        level: logsLevelFilter === 'ALL' ? undefined : logsLevelFilter,
        search: logsSearch.trim() || undefined,
      });
      set({
        logs: res.logs,
        logsTotal: res.total,
        logsTotalPages: res.totalPages,
      });
    } catch (err: unknown) {
      console.error('Failed to fetch logs:', err);
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  fetchUsers: async () => {
    const { usersPage, usersSearch, usersRoleFilter } = get();
    set({ isLoadingUsers: true });
    try {
      const res = await adminApi.getUsers({
        page: usersPage,
        limit: 10,
        role: usersRoleFilter === 'ALL' ? undefined : usersRoleFilter,
        search: usersSearch.trim() || undefined,
      });
      set({
        users: res.users,
        usersTotal: res.total,
        usersTotalPages: res.totalPages,
      });
    } catch (err: unknown) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  fetchWorkspaces: async () => {
    const { workspacesPage, workspacesSearch } = get();
    set({ isLoadingWorkspaces: true });
    try {
      const res = await adminApi.getWorkspaces({
        page: workspacesPage,
        limit: 10,
        search: workspacesSearch.trim() || undefined,
      });
      set({
        workspaces: res.workspaces,
        workspacesTotal: res.total,
        workspacesTotalPages: res.totalPages,
      });
    } catch (err: unknown) {
      console.error('Failed to fetch admin workspaces:', err);
    } finally {
      set({ isLoadingWorkspaces: false });
    }
  },

  fetchSettings: async () => {
    try {
      const settings = await adminApi.getSettings();
      set({ settings });
    } catch (err: unknown) {
      console.error('Failed to fetch admin settings:', err);
    }
  },

  refreshAll: async () => {
    const {
      fetchDashboardStats,
      fetchSystemHealth,
      fetchAIAnalytics,
      fetchLogs,
      fetchUsers,
      fetchWorkspaces,
    } = get();
    await Promise.all([
      fetchDashboardStats(),
      fetchSystemHealth(),
      fetchAIAnalytics(),
      fetchLogs(),
      fetchUsers(),
      fetchWorkspaces(),
    ]);
  },
}));
