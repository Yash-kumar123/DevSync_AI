import { create } from 'zustand';
import type {
  WorkspaceRole,
  WorkspaceMemberDTO,
  WorkspaceInvitationDTO,
  NotificationDTO,
  ActivityLogDTO,
  PresenceUser,
  ConnectionStatus,
  CollaborationUser,
  CursorPosition,
} from '@devsync/shared-types';
import { collaborationApi } from '../services/collaboration-api';

// =============================================================================
// DevSync AI — Collaboration State Store (Zustand)
// Global store for workspace members, roles, real-time presence, notifications,
// activity history, typing indicators, and room cursor sync.
// =============================================================================

interface CollaborationState {
  // Legacy room & cursor properties
  currentRoom: string | null;
  users: CollaborationUser[];
  connectionStatus: ConnectionStatus;
  activeFile: string | null;
  cursorData: CursorPosition | null;

  // Workspace Collaboration Module properties
  currentWorkspaceId: string | null;
  currentUserRole: WorkspaceRole | null;
  members: WorkspaceMemberDTO[];
  onlineUsers: PresenceUser[];
  notifications: NotificationDTO[];
  activities: ActivityLogDTO[];
  pendingInvitations: WorkspaceInvitationDTO[];
  typingUsers: Record<string, boolean>; // userId -> isTyping
  speakingUsers: Record<string, boolean>; // userId / socketId -> isSpeaking
  activeSpeakerUser: { displayName: string; avatarUrl?: string } | null;
  isLoadingMembers: boolean;
  isLoadingNotifications: boolean;
  isLoadingActivities: boolean;
  isInviteModalOpen: boolean;
  isSettingsModalOpen: boolean;
}

interface CollaborationActions {
  // Legacy actions
  setRoom: (roomCode: string | null) => void;
  setUsers: (users: CollaborationUser[]) => void;
  addUser: (user: CollaborationUser) => void;
  removeUser: (socketId: string) => void;
  updateUserCursor: (socketId: string, cursor: CursorPosition, isTyping?: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setActiveFile: (filePath: string | null) => void;
  setCursorData: (cursor: CursorPosition | null) => void;

  // Module actions
  setWorkspace: (workspaceId: string | null, role?: WorkspaceRole | null) => void;
  setCurrentUserRole: (role: WorkspaceRole | null) => void;
  setMembers: (members: WorkspaceMemberDTO[]) => void;
  setOnlineUsers: (onlineUsers: PresenceUser[]) => void;
  addOnlineUser: (user: PresenceUser) => void;
  removeOnlineUser: (userId: string) => void;
  updateUserTyping: (userId: string, isTyping: boolean) => void;
  updateUserSpeaking: (
    socketId: string,
    userId: string | undefined,
    isSpeaking: boolean,
    user?: unknown,
  ) => void;
  setNotifications: (notifications: NotificationDTO[]) => void;
  addNotification: (notification: NotificationDTO) => void;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  setActivities: (activities: ActivityLogDTO[]) => void;
  addActivity: (activity: ActivityLogDTO) => void;
  setPendingInvitations: (invitations: WorkspaceInvitationDTO[]) => void;

  // UI state toggles
  setInviteModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;

  // Async API actions
  fetchMembers: (workspaceId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchActivities: (workspaceId: string) => Promise<void>;
  fetchPendingInvitations: () => Promise<void>;
  updateMemberRoleInStore: (userId: string, newRole: WorkspaceRole) => void;
  removeMemberFromStore: (userId: string) => void;
  reset: () => void;
}

const initialState: CollaborationState = {
  currentRoom: null,
  users: [],
  connectionStatus: 'disconnected',
  activeFile: null,
  cursorData: null,

  currentWorkspaceId: null,
  currentUserRole: null,
  members: [],
  onlineUsers: [],
  notifications: [],
  activities: [],
  pendingInvitations: [],
  typingUsers: {},
  speakingUsers: {},
  activeSpeakerUser: null,
  isLoadingMembers: false,
  isLoadingNotifications: false,
  isLoadingActivities: false,
  isInviteModalOpen: false,
  isSettingsModalOpen: false,
};

export const useCollaborationStore = create<CollaborationState & CollaborationActions>()(
  (set, get) => ({
    ...initialState,

    // Legacy action implementations
    setRoom: (currentRoom) => set({ currentRoom }),

    setUsers: (users) => set({ users }),

    addUser: (user) =>
      set((state) => {
        const exists = state.users.some((u) => u.socketId === user.socketId);
        if (exists) {
          return {
            users: state.users.map((u) => (u.socketId === user.socketId ? user : u)),
          };
        }
        return { users: [...state.users, user] };
      }),

    removeUser: (socketId) =>
      set((state) => ({
        users: state.users.filter((u) => u.socketId !== socketId),
      })),

    updateUserCursor: (socketId, cursor, isTyping = false) =>
      set((state) => ({
        users: state.users.map((u) => (u.socketId === socketId ? { ...u, cursor, isTyping } : u)),
      })),

    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    setActiveFile: (activeFile) => set({ activeFile }),

    setCursorData: (cursorData) => set({ cursorData }),

    // Module action implementations
    setWorkspace: (workspaceId, role = null) =>
      set({ currentWorkspaceId: workspaceId, currentUserRole: role }),

    setCurrentUserRole: (currentUserRole) => set({ currentUserRole }),

    setMembers: (members) => set({ members }),

    setOnlineUsers: (onlineUsers) =>
      set({
        onlineUsers,
        users: onlineUsers.map((u) => ({
          socketId: u.socketId,
          userId: u.userId,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          color: u.color,
          cursor: u.cursor,
          isTyping: u.isTyping,
          joinedAt: u.lastActive,
        })),
      }),

    addOnlineUser: (user) =>
      set((state) => {
        const exists = state.onlineUsers.some((u) => u.userId === user.userId);
        const legacyUser: CollaborationUser = {
          socketId: user.socketId,
          userId: user.userId,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          color: user.color,
          cursor: user.cursor,
          isTyping: user.isTyping,
          joinedAt: user.lastActive,
        };

        const updatedOnline = exists
          ? state.onlineUsers.map((u) => (u.userId === user.userId ? user : u))
          : [...state.onlineUsers, user];

        const updatedLegacyUsers = state.users.some((u) => u.socketId === user.socketId)
          ? state.users.map((u) => (u.socketId === user.socketId ? legacyUser : u))
          : [...state.users, legacyUser];

        return { onlineUsers: updatedOnline, users: updatedLegacyUsers };
      }),

    removeOnlineUser: (userId) =>
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((u) => u.userId !== userId),
        users: state.users.filter((u) => u.userId !== userId),
      })),

    updateUserTyping: (userId, isTyping) =>
      set((state) => ({
        typingUsers: { ...state.typingUsers, [userId]: isTyping },
        onlineUsers: state.onlineUsers.map((u) => (u.userId === userId ? { ...u, isTyping } : u)),
        users: state.users.map((u) => (u.userId === userId ? { ...u, isTyping } : u)),
      })),

    updateUserSpeaking: (
      socketId: string,
      userId: string | undefined,
      isSpeaking: boolean,
      user?: unknown,
    ) =>
      set((state) => {
        const key = userId || socketId;
        const newSpeaking: Record<string, boolean> = { ...state.speakingUsers, [key]: isSpeaking };
        if (socketId) newSpeaking[socketId] = isSpeaking;

        let speakerUser: { displayName: string; avatarUrl?: string } | null = null;
        if (isSpeaking) {
          if (user && typeof user === 'object' && 'displayName' in user) {
            const u = user as { displayName: string; avatarUrl?: string };
            speakerUser = {
              displayName: u.displayName,
              ...(u.avatarUrl ? { avatarUrl: u.avatarUrl } : {}),
            };
          } else {
            const found = state.users.find(
              (u) => u.socketId === socketId || (userId && u.userId === userId),
            );
            if (found) {
              speakerUser = {
                displayName: found.displayName,
                ...(found.avatarUrl ? { avatarUrl: found.avatarUrl } : {}),
              };
            }
          }
        }

        return {
          speakingUsers: newSpeaking,
          activeSpeakerUser: speakerUser,
          users: state.users.map((u) =>
            u.socketId === socketId || (userId && u.userId === userId) ? { ...u, isSpeaking } : u,
          ),
        };
      }),

    setNotifications: (notifications) => set({ notifications }),

    addNotification: (notification) =>
      set((state) => ({
        notifications: [notification, ...state.notifications],
      })),

    markNotificationRead: async (notificationId) => {
      await collaborationApi.markNotificationRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      }));
    },

    markAllNotificationsRead: async () => {
      await collaborationApi.markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    },

    setActivities: (activities) => set({ activities }),

    addActivity: (activity) =>
      set((state) => ({
        activities: [activity, ...state.activities],
      })),

    setPendingInvitations: (pendingInvitations) => set({ pendingInvitations }),

    setInviteModalOpen: (isInviteModalOpen) => set({ isInviteModalOpen }),
    setSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),

    // Async fetching actions
    fetchMembers: async (workspaceId) => {
      set({ isLoadingMembers: true });
      try {
        const members = await collaborationApi.getWorkspaceMembers(workspaceId);
        set({ members });
      } catch (err) {
        console.error('Failed to fetch workspace members:', err);
      } finally {
        set({ isLoadingMembers: false });
      }
    },

    fetchNotifications: async () => {
      set({ isLoadingNotifications: true });
      try {
        const notifications = await collaborationApi.getNotifications();
        set({ notifications });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        set({ isLoadingNotifications: false });
      }
    },

    fetchActivities: async (workspaceId) => {
      set({ isLoadingActivities: true });
      try {
        const activities = await collaborationApi.getWorkspaceActivities(workspaceId);
        set({ activities });
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        set({ isLoadingActivities: false });
      }
    },

    fetchPendingInvitations: async () => {
      try {
        const pendingInvitations = await collaborationApi.getPendingInvitations();
        set({ pendingInvitations });
      } catch (err) {
        console.error('Failed to fetch pending invitations:', err);
      }
    },

    updateMemberRoleInStore: (userId, newRole) => {
      const state = get();
      set({
        members: state.members.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)),
        onlineUsers: state.onlineUsers.map((u) =>
          u.userId === userId ? { ...u, role: newRole } : u,
        ),
      });
    },

    removeMemberFromStore: (userId) => {
      const state = get();
      set({
        members: state.members.filter((m) => m.userId !== userId),
        onlineUsers: state.onlineUsers.filter((u) => u.userId !== userId),
        users: state.users.filter((u) => u.userId !== userId),
      });
    },

    reset: () => set(initialState),
  }),
);
