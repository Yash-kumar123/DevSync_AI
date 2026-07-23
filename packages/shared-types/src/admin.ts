// =============================================================================
// DevSync AI — Shared Admin, Monitoring, & Analytics Types
// =============================================================================

export interface DashboardStatsDTO {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
  onlineUsers: number;
  aiRequests: number;
  terminalSessions: number;
  gitOperations: number;
  storageUsageBytes: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  charts: {
    dailyUsers: Array<{ date: string; count: number }>;
    aiUsage: Array<{ date: string; model: string; count: number }>;
    workspaceGrowth: Array<{ date: string; count: number }>;
    apiRequests: Array<{ timestamp: string; count: number; errorCount: number }>;
  };
}

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface SystemServiceHealth {
  name: 'Redis' | 'Database' | 'AI Service' | 'Gateway' | 'Frontend';
  status: HealthStatus;
  latencyMs: number;
  uptimeSeconds: number;
  message: string;
  lastChecked: string;
}

export interface SystemHealthDTO {
  overallStatus: HealthStatus;
  services: SystemServiceHealth[];
  systemLoad: {
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
  };
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type LogService = 'AUTHENTICATION' | 'WORKSPACE' | 'AI' | 'TERMINAL' | 'GATEWAY' | 'ERROR';

export interface SystemLogDTO {
  id: string;
  timestamp: string;
  service: LogService;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown> | null | undefined;
}

export interface AIAnalyticsDTO {
  totalRequests: number;
  avgLatencyMs: number;
  totalTokens: number;
  errorRatePercent: number;
  modelBreakdown: Array<{ model: string; requests: number; tokens: number }>;
  dailyTrends: Array<{ date: string; requests: number; tokens: number; errors: number }>;
}

export interface AdminUserDTO {
  id: string;
  avatarUrl?: string | null | undefined;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface AdminWorkspaceDTO {
  id: string;
  name: string;
  roomCode: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  membersCount: number;
  createdDate: string;
  activeStatus: 'active' | 'archived' | 'idle';
}

export interface AdminSettingsDTO {
  refreshIntervalSeconds: number;
  logRetentionDays: number;
  alertCpuThresholdPercent: number;
  alertMemoryThresholdPercent: number;
  alertEmails: string[];
  enableAiTelemetry: boolean;
}
