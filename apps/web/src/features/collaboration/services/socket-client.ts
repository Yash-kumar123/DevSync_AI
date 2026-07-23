import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCollaborationStore } from '../store/collaboration-store';
import { useAuthStore } from '../../../store/auth-store';
import type {
  UserOnlinePayload,
  UserOfflinePayload,
  RoleUpdatedPayload,
  NotificationPayload,
  ActivityUpdatePayload,
  TypingStatusPayload,
  WorkspaceInvitationPayload,
  CollaborationUser,
  CursorPosition,
  JoinRoomResponse,
  WorkspaceRole,
  PresenceUser,
} from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Socket.io Real-time Collaboration Client Service
// Manages WebSocket connection, automatic reconnection, workspace rooms,
// real-time notifications, presence badges, and role synchronization.
// =============================================================================

export class SocketClientService {
  private socket: Socket | null = null;
  private currentWorkspaceId: string | null = null;
  private currentRoomCode: string | null = null;
  private editorChangeCallbacks: Array<(update: string, filePath?: string) => void> = [];

  /** Get active Socket.io client instance or establish connection. */
  connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = useAuthStore.getState().accessToken;
    const rawUrl =
      import.meta.env.VITE_GATEWAY_WS_URL ||
      import.meta.env.VITE_GATEWAY_HTTP_URL ||
      import.meta.env.VITE_API_URL;
    const socketTargetUrl = rawUrl ? rawUrl.replace(/\/+$/, '') : undefined;

    const socketOptions = {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    };

    this.socket = socketTargetUrl ? io(socketTargetUrl, socketOptions) : io(socketOptions);

    this.registerSocketListeners(this.socket);
    return this.socket;
  }

  /** Register connection, presence, workspace, role, and notification event listeners. */
  private registerSocketListeners(socket: Socket): void {
    socket.on('connect', () => {
      useCollaborationStore.getState().setConnectionStatus('connected');
      if (this.currentWorkspaceId) {
        this.rejoinActiveWorkspace();
      }
    });

    socket.on('disconnect', (reason) => {
      useCollaborationStore.getState().setConnectionStatus('disconnected');
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.io.on('reconnect_attempt', () => {
      useCollaborationStore.getState().setConnectionStatus('reconnecting');
    });

    socket.io.on('reconnect', () => {
      useCollaborationStore.getState().setConnectionStatus('connected');
      if (this.currentWorkspaceId) {
        this.rejoinActiveWorkspace();
      }
    });

    // ── 1. user-online ──────────────────────────────────────────────────────
    socket.on('user-online', (payload: UserOnlinePayload) => {
      if (payload.onlineUsers) {
        useCollaborationStore.getState().setOnlineUsers(payload.onlineUsers);
      } else if (payload.user) {
        useCollaborationStore.getState().addOnlineUser(payload.user);
      }

      // Show toast if user joined (and it is not current user)
      const currentUser = useAuthStore.getState().user;
      if (payload.user && currentUser && payload.user.userId !== currentUser.id) {
        toast.success(`${payload.user.displayName} is now online`, {
          icon: '🟢',
          id: `online-${payload.user.userId}`,
        });
      }
    });

    // ── 2. user-offline ─────────────────────────────────────────────────────
    socket.on('user-offline', (payload: UserOfflinePayload) => {
      if (payload.onlineUsers) {
        useCollaborationStore.getState().setOnlineUsers(payload.onlineUsers);
      } else if (payload.userId) {
        useCollaborationStore.getState().removeOnlineUser(payload.userId);
      }
    });

    // ── 3. workspace-invitation ─────────────────────────────────────────────
    socket.on('workspace-invitation', (payload: WorkspaceInvitationPayload) => {
      if (payload.invitation) {
        const store = useCollaborationStore.getState();
        store.setPendingInvitations([payload.invitation, ...store.pendingInvitations]);

        const inviterName = payload.invitation.inviter?.displayName || 'Someone';
        const wsName = payload.invitation.workspaceName || 'Workspace';
        toast(`Invitation from ${inviterName} to join "${wsName}" as ${payload.invitation.role}`, {
          icon: '📩',
          duration: 6000,
        });
      }
    });

    // ── 4. role-updated ─────────────────────────────────────────────────────
    socket.on('role-updated', (payload: RoleUpdatedPayload) => {
      if (payload.userId && payload.newRole) {
        const store = useCollaborationStore.getState();
        store.updateMemberRoleInStore(payload.userId, payload.newRole);

        const currentUser = useAuthStore.getState().user;
        if (currentUser && payload.userId === currentUser.id) {
          store.setCurrentUserRole(payload.newRole);
          toast(`Your workspace role has been updated to ${payload.newRole}`, {
            icon: '🛡️',
            duration: 4000,
          });
        }
      }
    });

    // ── 5. notification ─────────────────────────────────────────────────────
    socket.on('notification', (payload: NotificationPayload) => {
      if (payload.notification) {
        useCollaborationStore.getState().addNotification(payload.notification);
        toast(payload.notification.title, {
          icon: '🔔',
        });
      }
    });

    // ── 6. activity-update ──────────────────────────────────────────────────
    socket.on('activity-update', (payload: ActivityUpdatePayload) => {
      if (payload.activity) {
        useCollaborationStore.getState().addActivity(payload.activity);
      }
    });

    // ── 7. typing-status ────────────────────────────────────────────────────
    socket.on('typing-status', (payload: TypingStatusPayload) => {
      if (payload.userId) {
        useCollaborationStore.getState().updateUserTyping(payload.userId, payload.isTyping);
      }
    });

    // Legacy / Editor sync events
    socket.on('user-joined', (payload: { user: CollaborationUser; users: CollaborationUser[] }) => {
      if (payload.users) {
        useCollaborationStore.getState().setOnlineUsers?.(
          payload.users.map((u) => ({
            socketId: u.socketId,
            userId: u.userId,
            username: u.username,
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,
            role: 'EDITOR' as WorkspaceRole,
            color: u.color,
            isOnline: true,
            lastActive: new Date().toISOString(),
            isTyping: u.isTyping,
          })),
        );
      }
    });

    socket.on('user-left', (payload: { socketId: string; user?: CollaborationUser }) => {
      if (payload.user?.userId) {
        useCollaborationStore.getState().removeOnlineUser(payload.user.userId);
      }
    });

    socket.on(
      'editor-change',
      (payload: { socketId: string; update: string; filePath?: string }) => {
        if (payload.update) {
          this.editorChangeCallbacks.forEach((cb) => cb(payload.update, payload.filePath));
        }
      },
    );
  }

  /** Join workspace real-time room. */
  joinWorkspace(workspaceId: string): Promise<boolean> {
    const socket = this.connect();
    const user = useAuthStore.getState().user;
    if (!user) return Promise.resolve(false);

    this.currentWorkspaceId = workspaceId;
    useCollaborationStore.getState().setWorkspace(workspaceId);

    return new Promise((resolve) => {
      socket.emit(
        'join-workspace',
        {
          workspaceId,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
          },
        },
        (response: { success: boolean; role?: WorkspaceRole; onlineUsers?: PresenceUser[] }) => {
          if (response?.success) {
            if (response.role) {
              useCollaborationStore.getState().setCurrentUserRole(response.role);
            }
            if (response.onlineUsers) {
              useCollaborationStore.getState().setOnlineUsers(response.onlineUsers);
            }
            resolve(true);
          } else {
            resolve(false);
          }
        },
      );
    });
  }

  /** Emit typing indicator status. */
  emitTypingStatus(workspaceId: string, isTyping: boolean, filePath?: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing-status', { workspaceId, isTyping, filePath });
    }
  }

  /** Re-join active workspace on reconnect. */
  private rejoinActiveWorkspace(): void {
    if (this.currentWorkspaceId) {
      void this.joinWorkspace(this.currentWorkspaceId);
    }
  }

  /** Leave current workspace room. */
  leaveWorkspace(workspaceId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-workspace', { workspaceId });
    }
    this.currentWorkspaceId = null;
    useCollaborationStore.getState().setWorkspace(null);
  }

  // ── Legacy Room Sync Methods ────────────────────────────────────────────────
  joinRoom(
    roomCode: string,
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null | undefined;
    },
  ): Promise<JoinRoomResponse> {
    const socket = this.connect();
    this.currentRoomCode = roomCode;

    if (socket.connected) {
      useCollaborationStore.getState().setConnectionStatus('connected');
    }

    return new Promise((resolve) => {
      socket.emit('join-room', { roomCode, user }, (response: JoinRoomResponse) => {
        if (response?.success) {
          useCollaborationStore.getState().setConnectionStatus('connected');
        }
        resolve(response || { success: false, message: 'No response from server.' });
      });
    });
  }

  leaveRoom(): void {
    if (this.socket && this.currentRoomCode) {
      this.socket.emit('leave-room', { roomCode: this.currentRoomCode });
      this.currentRoomCode = null;
    }
  }

  emitEditorChange(base64Update: string, filePath?: string): void {
    if (this.socket && this.currentRoomCode) {
      this.socket.emit('editor-change', {
        roomCode: this.currentRoomCode,
        update: base64Update,
        filePath,
      });
    }
  }

  emitCursorChange(cursor: CursorPosition, isTyping = false): void {
    if (this.socket && this.currentRoomCode) {
      this.socket.emit('cursor-change', {
        roomCode: this.currentRoomCode,
        cursor,
        isTyping,
      });
    }
  }

  onEditorChange(callback: (update: string, filePath?: string) => void): () => void {
    this.editorChangeCallbacks.push(callback);
    return () => {
      this.editorChangeCallbacks = this.editorChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClientService();
