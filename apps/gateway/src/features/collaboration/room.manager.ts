import type { RoomState, RoomUser } from './collaboration.types.js';

// =============================================================================
// DevSync AI — Room Manager
// Manages collaboration room instances, user rosters, CRDT state buffers,
// and automatic cleanup of empty rooms.
// =============================================================================

export class RoomManager {
  private readonly rooms = new Map<string, RoomState>();
  private readonly socketToRoom = new Map<string, string>(); // socketId -> roomCode

  /** Create or retrieve an existing room by room code. */
  getOrCreateRoom(roomCode: string, name?: string): RoomState {
    let room = this.rooms.get(roomCode);
    if (!room) {
      room = {
        roomCode,
        name: name ?? `Room ${roomCode}`,
        users: new Map<string, RoomUser>(),
        yjsStateBuffer: null,
        createdAt: new Date().toISOString(),
      };
      this.rooms.set(roomCode, room);
    }
    return room;
  }

  /** Add a user to a room. */
  addUser(roomCode: string, user: RoomUser): RoomState {
    const room = this.getOrCreateRoom(roomCode);
    room.users.set(user.socketId, user);
    this.socketToRoom.set(user.socketId, roomCode);
    return room;
  }

  /** Remove a user from a room by socketId. Returns updated room and roomCode. */
  removeUser(socketId: string): {
    room: RoomState | null;
    roomCode: string | null;
    removedUser: RoomUser | null;
  } {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return { room: null, roomCode: null, removedUser: null };

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(roomCode);
    if (!room) return { room: null, roomCode, removedUser: null };

    const removedUser = room.users.get(socketId) ?? null;
    room.users.delete(socketId);

    // Automatically clean up empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(roomCode);
      return { room: null, roomCode, removedUser };
    }

    return { room, roomCode, removedUser };
  }

  /** Get a room by room code. */
  getRoom(roomCode: string): RoomState | undefined {
    return this.rooms.get(roomCode);
  }

  /** Get active room code for a given socketId. */
  getRoomCodeBySocket(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  /** Get list of users in a room as an array. */
  getRoomUsers(roomCode: string): RoomUser[] {
    const room = this.rooms.get(roomCode);
    return room ? Array.from(room.users.values()) : [];
  }

  /** Append / store Yjs CRDT state update buffer for late-joining sync. */
  setRoomYjsState(roomCode: string, stateBuffer: Uint8Array): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.yjsStateBuffer = stateBuffer;
    }
  }

  /** Retrieve Yjs CRDT state buffer. */
  getRoomYjsState(roomCode: string): Uint8Array | null {
    return this.rooms.get(roomCode)?.yjsStateBuffer ?? null;
  }
}
