import type { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service.js';
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  LeaveRoomPayload,
  EditorChangePayload,
  CursorChangePayload,
} from './collaboration.types.js';

// =============================================================================
// DevSync AI — Collaboration Controller
// Listens to client Socket.io events and broadcasts state changes to room peers.
// =============================================================================

export class CollaborationController {
  constructor(private readonly service: CollaborationService = new CollaborationService()) {}

  registerHandlers(io: Server, socket: Socket): void {
    // ── create-room ──────────────────────────────────────────────────────────
    socket.on('create-room', (payload: CreateRoomPayload, callback?: (res: unknown) => void) => {
      try {
        const room = this.service.createRoom(payload);
        socket.join(payload.roomCode);
        if (callback) callback({ success: true, room });
      } catch {
        if (callback) callback({ success: false, message: 'Failed to create room.' });
      }
    });

    // ── join-room ────────────────────────────────────────────────────────────
    socket.on('join-room', (payload: JoinRoomPayload, callback?: (res: unknown) => void) => {
      try {
        const { user } = this.service.joinRoom(socket.id, payload);
        socket.join(payload.roomCode);

        const roomUsers = this.service.getRoomUsers(payload.roomCode);
        const latestYjsState = this.service.getYjsState(payload.roomCode);

        // Notify caller with current room users & Yjs state update vector
        if (callback) {
          callback({
            success: true,
            user,
            users: roomUsers,
            yjsState: latestYjsState,
          });
        }

        // Broadcast to other users in the room
        socket.to(payload.roomCode).emit('user-joined', { user, users: roomUsers });
        io.to(payload.roomCode).emit('room-users', { users: roomUsers });
      } catch {
        if (callback) callback({ success: false, message: 'Failed to join room.' });
      }
    });

    // ── leave-room ───────────────────────────────────────────────────────────
    socket.on('leave-room', (payload: LeaveRoomPayload) => {
      socket.leave(payload.roomCode);
      const { removedUser, remainingUsers } = this.service.leaveRoom(socket.id);
      if (removedUser) {
        socket.to(payload.roomCode).emit('user-left', { socketId: socket.id, user: removedUser });
        io.to(payload.roomCode).emit('room-users', { users: remainingUsers });
      }
    });

    // ── editor-change (Yjs CRDT Update Sync) ─────────────────────────────────
    socket.on('editor-change', (payload: EditorChangePayload) => {
      if (!payload.roomCode || !payload.update) return;

      // Save update to backend buffer for late joiners
      this.service.saveYjsUpdate(payload.roomCode, payload.update);

      // Broadcast Yjs update chunk to all other peers in the room
      socket.to(payload.roomCode).emit('editor-change', {
        socketId: socket.id,
        update: payload.update,
        filePath: payload.filePath,
      });
    });

    // ── cursor-change (Remote Cursor & Selection) ─────────────────────────────
    socket.on('cursor-change', (payload: CursorChangePayload) => {
      if (!payload.roomCode || !payload.cursor) return;

      const result = this.service.updateCursor(
        socket.id,
        payload.cursor,
        payload.isTyping ?? false,
      );
      if (result) {
        socket.to(payload.roomCode).emit('cursor-change', {
          socketId: socket.id,
          user: result.user,
          cursor: payload.cursor,
          isTyping: payload.isTyping ?? false,
        });
      }
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomCode, removedUser, remainingUsers } = this.service.leaveRoom(socket.id);
      if (roomCode && removedUser) {
        socket.to(roomCode).emit('user-left', { socketId: socket.id, user: removedUser });
        io.to(roomCode).emit('room-users', { users: remainingUsers });
      }
    });
  }
}
