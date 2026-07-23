import type { RoomUser, UserCursor } from './collaboration.types.js';

// =============================================================================
// DevSync AI — User Presence Manager
// Manages active user cursors, color assignments, typing states, and socket maps.
// =============================================================================

const CURSOR_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#84cc16', // Lime
];

export class UserPresenceManager {
  private userColorIndex = 0;

  /** Generate a distinct color from the palette for a joining user. */
  assignColor(socketId: string): string {
    // Hash socket ID to consistently assign colors, fallback to round-robin
    let hash = 0;
    for (let i = 0; i < socketId.length; i++) {
      hash = socketId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CURSOR_COLORS.length;
    return CURSOR_COLORS[index] ?? CURSOR_COLORS[0]!;
  }

  /** Update user's cursor position and typing status. */
  updateUserCursor(user: RoomUser, cursor: UserCursor, isTyping = false): RoomUser {
    return {
      ...user,
      cursor,
      isTyping,
    };
  }
}
