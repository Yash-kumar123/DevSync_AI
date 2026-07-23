import { RoomManager } from './room.manager.js';
import { UserPresenceManager } from './user-presence.manager.js';
import { RedisAdapterPlaceholder } from './redis-adapter.placeholder.js';
import type {
  RoomUser,
  RoomState,
  JoinRoomPayload,
  CreateRoomPayload,
  UserCursor,
} from './collaboration.types.js';

// =============================================================================
// DevSync AI — Collaboration Service
// Business logic orchestrating room allocation, user presence, Yjs CRDT state
// caching, and multi-user event publishing.
// =============================================================================

export class CollaborationService {
  constructor(
    private readonly roomManager: RoomManager = new RoomManager(),
    private readonly presenceManager: UserPresenceManager = new UserPresenceManager(),
    private readonly redisAdapter: RedisAdapterPlaceholder = new RedisAdapterPlaceholder(),
  ) {}

  /** Create a new collaboration room. */
  createRoom(payload: CreateRoomPayload): RoomState {
    return this.roomManager.getOrCreateRoom(payload.roomCode, payload.name);
  }

  /** Add user to room and assign a distinct cursor color. */
  joinRoom(socketId: string, payload: JoinRoomPayload): { room: RoomState; user: RoomUser } {
    const color = this.presenceManager.assignColor(socketId);
    const roomUser: RoomUser = {
      socketId,
      userId: payload.user.id,
      username: payload.user.username,
      displayName: payload.user.displayName,
      avatarUrl: payload.user.avatarUrl ?? null,
      color,
      isTyping: false,
      joinedAt: new Date().toISOString(),
    };

    const room = this.roomManager.addUser(payload.roomCode, roomUser);
    return { room, user: roomUser };
  }

  /** Remove user from room and trigger empty room cleanup if applicable. */
  leaveRoom(socketId: string): {
    roomCode: string | null;
    removedUser: RoomUser | null;
    remainingUsers: RoomUser[];
  } {
    const { roomCode, removedUser } = this.roomManager.removeUser(socketId);
    const remainingUsers = roomCode ? this.roomManager.getRoomUsers(roomCode) : [];
    return { roomCode, removedUser, remainingUsers };
  }

  /** Update user cursor position and typing status. */
  updateCursor(
    socketId: string,
    cursor: UserCursor,
    isTyping = false,
  ): { roomCode: string; user: RoomUser } | null {
    const roomCode = this.roomManager.getRoomCodeBySocket(socketId);
    if (!roomCode) return null;

    const room = this.roomManager.getRoom(roomCode);
    if (!room) return null;

    const user = room.users.get(socketId);
    if (!user) return null;

    const updatedUser = this.presenceManager.updateUserCursor(user, cursor, isTyping);
    room.users.set(socketId, updatedUser);

    return { roomCode, user: updatedUser };
  }

  /** Save Base64 encoded Yjs CRDT update buffer to room cache. */
  saveYjsUpdate(roomCode: string, base64Update: string): void {
    try {
      const updateBuffer = Buffer.from(base64Update, 'base64');
      const existingBuffer = this.roomManager.getRoomYjsState(roomCode);
      if (!existingBuffer) {
        this.roomManager.setRoomYjsState(roomCode, updateBuffer);
      } else {
        // Concatenate updates into room buffer
        const merged = Buffer.concat([existingBuffer, updateBuffer]);
        this.roomManager.setRoomYjsState(roomCode, merged);
      }
    } catch {
      // Ignore binary parse error
    }
  }

  /** Get current Yjs document state buffer for late-joining user sync. */
  getYjsState(roomCode: string): string | null {
    const buffer = this.roomManager.getRoomYjsState(roomCode);
    return buffer ? Buffer.from(buffer).toString('base64') : null;
  }

  /** Get list of active users in room. */
  getRoomUsers(roomCode: string): RoomUser[] {
    return this.roomManager.getRoomUsers(roomCode);
  }
}
