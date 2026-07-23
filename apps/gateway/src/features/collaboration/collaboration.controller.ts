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
        const code = payload.roomCode;
        socket.join(code);
        socket.join(`workspace:${code}`);

        const roomUsers = this.service.getRoomUsers(code);
        const latestYjsState = this.service.getYjsState(code);

        // Notify caller with current room users & Yjs state update vector
        if (callback) {
          callback({
            success: true,
            user,
            users: roomUsers,
            yjsState: latestYjsState,
          });
        }

        // Broadcast to other users in the room across both room name aliases
        socket.to(code).emit('user-joined', { user, users: roomUsers });
        socket.to(`workspace:${code}`).emit('user-joined', { user, users: roomUsers });
        io.to(code).emit('room-users', { users: roomUsers });
        io.to(`workspace:${code}`).emit('room-users', { users: roomUsers });
      } catch {
        if (callback) callback({ success: false, message: 'Failed to join room.' });
      }
    });

    // ── leave-room ───────────────────────────────────────────────────────────
    socket.on('leave-room', (payload: LeaveRoomPayload) => {
      const code = payload.roomCode;
      socket.leave(code);
      socket.leave(`workspace:${code}`);
      const { removedUser, remainingUsers } = this.service.leaveRoom(socket.id);
      if (removedUser) {
        socket.to(code).emit('user-left', { socketId: socket.id, user: removedUser });
        socket
          .to(`workspace:${code}`)
          .emit('user-left', { socketId: socket.id, user: removedUser });
        io.to(code).emit('room-users', { users: remainingUsers });
        io.to(`workspace:${code}`).emit('room-users', { users: remainingUsers });
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

    // ── chat-message (Live Workspace Communication) ──────────────────────────
    socket.on(
      'chat-message',
      (payload: {
        roomCode?: string;
        workspaceId?: string;
        message: string;
        user?: { id: string; displayName: string; username?: string; avatarUrl?: string };
      }) => {
        const room = payload.roomCode || payload.workspaceId;
        if (!room || !payload.message?.trim()) return;

        const chatPayload = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          roomCode: room,
          workspaceId: room,
          message: payload.message.trim(),
          user: payload.user || { id: socket.id, displayName: 'Developer', username: 'peer' },
          timestamp: new Date().toISOString(),
        };

        io.to(room).emit('chat-message', chatPayload);
      },
    );

    // ── file-changed (Automatic Real-time Sync across peers) ──────────────────
    socket.on(
      'file-changed',
      (payload: { roomCode?: string; workspaceId?: string; action: string; fileName?: string }) => {
        const room = payload.roomCode || payload.workspaceId;
        if (!room) return;
        socket.to(room).emit('file-changed', payload);
      },
    );

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
