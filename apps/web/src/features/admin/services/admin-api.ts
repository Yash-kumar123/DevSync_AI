import { http } from '../../../services/http.js';
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

// =============================================================================
// DevSync AI — Admin REST API Client
// Handles telemetry data fetching, health monitoring metrics, system log streams,
// user & workspace admin tables, and admin settings.
// =============================================================================

export class AdminApiClient {
  /** Fetch overview dashboard statistics and chart metrics. */
  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const res = await http.get<{ success: boolean; stats: DashboardStatsDTO }>('/v1/admin/stats');
    return res.data.stats;
  }

  /** Fetch real-time system health telemetry. */
  async getSystemHealth(): Promise<SystemHealthDTO> {
    const res = await http.get<{ success: boolean; health: SystemHealthDTO }>(
      '/v1/admin/monitoring',
    );
    return res.data.health;
  }

  /** Fetch AI analytics & model usage statistics. */
  async getAIAnalytics(): Promise<AIAnalyticsDTO> {
    const res = await http.get<{ success: boolean; analytics: AIAnalyticsDTO }>(
      '/v1/admin/ai-analytics',
    );
    return res.data.analytics;
  }

  /** Query system logs with search, level/service filters, and pagination. */
  async getLogs(params: {
    page?: number | undefined;
    limit?: number | undefined;
    service?: LogService | undefined;
    level?: LogLevel | undefined;
    search?: string | undefined;
  }): Promise<{ logs: SystemLogDTO[]; total: number; page: number; totalPages: number }> {
    const res = await http.get<{
      success: boolean;
      logs: SystemLogDTO[];
      total: number;
      page: number;
      totalPages: number;
    }>('/v1/admin/logs', { params });
    return res.data;
  }

  /** Query admin users list with pagination and search. */
  async getUsers(params: {
    page?: number | undefined;
    limit?: number | undefined;
    role?: string | undefined;
    search?: string | undefined;
  }): Promise<{ users: AdminUserDTO[]; total: number; page: number; totalPages: number }> {
    const res = await http.get<{
      success: boolean;
      users: AdminUserDTO[];
      total: number;
      page: number;
      totalPages: number;
    }>('/v1/admin/users', { params });
    return res.data;
  }

  /** Query admin workspaces list with pagination and search. */
  async getWorkspaces(params: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
  }): Promise<{
    workspaces: AdminWorkspaceDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const res = await http.get<{
      success: boolean;
      workspaces: AdminWorkspaceDTO[];
      total: number;
      page: number;
      totalPages: number;
    }>('/v1/admin/workspaces', { params });
    return res.data;
  }

  /** Fetch admin settings configurations. */
  async getSettings(): Promise<AdminSettingsDTO> {
    const res = await http.get<{ success: boolean; settings: AdminSettingsDTO }>(
      '/v1/admin/settings',
    );
    return res.data.settings;
  }
}

export const adminApi = new AdminApiClient();
