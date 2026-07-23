import type { PresenceUser, WorkspaceRole } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Online Presence Service
// Manages real-time socket connections, user online status, last active timestamps,
// typing indicators, and active workspace presence badges.
// =============================================================================

const AVATAR_COLORS = [
  '#F87171',
  '#FBBF24',
  '#34D399',
  '#60A5FA',
  '#818CF8',
  '#A78BFA',
  '#F472B6',
  '#EC4899',
];

interface ConnectedUserSession {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null | undefined;
  workspaceId: string;
  role: WorkspaceRole;
  color: string;
  lastActive: Date;
  isTyping: boolean;
  activeFile?: string | null | undefined;
}

export class PresenceService {
  /** In-memory store: workspaceId -> Map<socketId, ConnectedUserSession> */
  private activeWorkspaces: Map<string, Map<string, ConnectedUserSession>> = new Map();

  /** Map socketId -> { workspaceId, userId } for quick lookup on disconnect */
  private socketToWorkspaceMap: Map<string, { workspaceId: string; userId: string }> = new Map();

  /** Register user connection to a workspace room. */
  userJoined(
    socketId: string,
    workspaceId: string,
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null | undefined;
      role: WorkspaceRole;
    },
  ): PresenceUser {
    if (!this.activeWorkspaces.has(workspaceId)) {
      this.activeWorkspaces.set(workspaceId, new Map());
    }

    const roomUsers = this.activeWorkspaces.get(workspaceId)!;
    const colorIndex = Math.abs(this.hashCode(user.id)) % AVATAR_COLORS.length;

    const session: ConnectedUserSession = {
      socketId,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      workspaceId,
      role: user.role,
      color: AVATAR_COLORS[colorIndex] ?? '#60A5FA',
      lastActive: new Date(),
      isTyping: false,
    };

    if (user.avatarUrl !== undefined) {
      session.avatarUrl = user.avatarUrl;
    }

    roomUsers.set(socketId, session);
    this.socketToWorkspaceMap.set(socketId, { workspaceId, userId: user.id });

    return this.toPresenceUser(session, true);
  }

  /** Remove user session on room leave or socket disconnect. */
  userLeft(socketId: string): {
    workspaceId?: string;
    userId?: string;
    remainingUsers: PresenceUser[];
  } {
    const meta = this.socketToWorkspaceMap.get(socketId);
    if (!meta) {
      return { remainingUsers: [] };
    }

    const { workspaceId, userId } = meta;
    this.socketToWorkspaceMap.delete(socketId);

    const roomUsers = this.activeWorkspaces.get(workspaceId);
    if (roomUsers) {
      roomUsers.delete(socketId);
      if (roomUsers.size === 0) {
        this.activeWorkspaces.delete(workspaceId);
      }
    }

    const remainingUsers = this.getOnlineUsers(workspaceId);
    return { workspaceId, userId, remainingUsers };
  }

  /** Update typing status & last active timestamp for a socket. */
  updateTypingStatus(socketId: string, isTyping: boolean, filePath?: string): PresenceUser | null {
    const meta = this.socketToWorkspaceMap.get(socketId);
    if (!meta) return null;

    const roomUsers = this.activeWorkspaces.get(meta.workspaceId);
    const session = roomUsers?.get(socketId);

    if (session) {
      session.isTyping = isTyping;
      session.lastActive = new Date();
      if (filePath !== undefined) {
        session.activeFile = filePath;
      }
      return this.toPresenceUser(session, true);
    }
    return null;
  }

  /** Get all online users for a workspace. */
  getOnlineUsers(workspaceId: string): PresenceUser[] {
    const roomUsers = this.activeWorkspaces.get(workspaceId);
    if (!roomUsers) return [];

    return Array.from(roomUsers.values()).map((session) => this.toPresenceUser(session, true));
  }

  /** Check if a specific user is currently online in a workspace. */
  isUserOnline(workspaceId: string, userId: string): boolean {
    const roomUsers = this.activeWorkspaces.get(workspaceId);
    if (!roomUsers) return false;

    return Array.from(roomUsers.values()).some((s) => s.userId === userId);
  }

  /** Convert ConnectedUserSession to PresenceUser DTO. */
  private toPresenceUser(session: ConnectedUserSession, isOnline: boolean): PresenceUser {
    const user: PresenceUser = {
      socketId: session.socketId,
      userId: session.userId,
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      color: session.color,
      isOnline,
      lastActive: session.lastActive.toISOString(),
      isTyping: session.isTyping,
    };

    if (session.avatarUrl !== undefined) {
      user.avatarUrl = session.avatarUrl;
    }

    if (session.activeFile !== undefined) {
      user.activeFile = session.activeFile;
    }

    return user;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
