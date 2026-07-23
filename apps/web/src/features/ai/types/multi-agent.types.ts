// =============================================================================
// DevSync AI — Multi-Agent AI Types
// =============================================================================

export type AgentMode = 'standard' | 'rag' | 'multi-agent';

export type MultiAgentStepName =
  'idle' | 'retrieving_context' | 'builder_agent' | 'critic_agent' | 'complete';

export interface CriticAudit {
  security_status: string;
  performance_status: string;
  improvements_applied: string[];
}

export interface MultiAgentStepPayload {
  step?: MultiAgentStepName;
  content?: string;
  critic_audit?: CriticAudit;
  done?: boolean;
}
