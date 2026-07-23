// =============================================================================
// DevSync AI — Collaboration Module Types
// =============================================================================

export interface UserCursor {
  lineNumber: number;
  column: number;
  selectionHead?: { lineNumber: number; column: number } | undefined;
}

export interface RoomUser {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null | undefined;
  color: string;
  cursor?: UserCursor | undefined;
  isTyping: boolean;
  joinedAt: string;
}

export interface RoomState {
  roomCode: string;
  name: string;
  users: Map<string, RoomUser>; // key: socketId
  yjsStateBuffer: Uint8Array | null; // CRDT binary state vector buffer
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Socket.io Event Payloads
// ---------------------------------------------------------------------------

export interface CreateRoomPayload {
  roomCode: string;
  name?: string | undefined;
}

export interface JoinRoomPayload {
  roomCode: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null | undefined;
  };
}

export interface LeaveRoomPayload {
  roomCode: string;
}

export interface EditorChangePayload {
  roomCode: string;
  update: string; // Base64 encoded Yjs document binary update chunk
  filePath?: string;
}

export interface CursorChangePayload {
  roomCode: string;
  cursor: UserCursor;
  isTyping?: boolean;
}
