// =============================================================================
// DevSync AI — Frontend Collaboration Types
// =============================================================================

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface CursorPosition {
  lineNumber: number;
  column: number;
  selectionHead?: { lineNumber: number; column: number } | undefined;
}

export interface CollaborationUser {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null | undefined;
  color: string;
  cursor?: CursorPosition | undefined;
  isTyping: boolean;
  joinedAt: string;
}

export interface JoinRoomResponse {
  success: boolean;
  user?: CollaborationUser | undefined;
  users?: CollaborationUser[] | undefined;
  yjsState?: string | null | undefined; // Base64 CRDT update vector
  message?: string | undefined;
}
