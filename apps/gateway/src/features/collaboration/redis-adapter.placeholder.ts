// =============================================================================
// DevSync AI — Redis Adapter Architecture (Placeholder / Interface)
// Prepares Redis Pub/Sub adapter interface for Socket.io horizontal scaling
// across multiple API gateway server instances.
// =============================================================================

export interface IRedisAdapter {
  publishRoomEvent(roomCode: string, eventName: string, payload: unknown): Promise<void>;
  subscribeRoomEvent(
    roomCode: string,
    callback: (eventName: string, payload: unknown) => void,
  ): Promise<void>;
  getRoomStateBuffer(roomCode: string): Promise<Uint8Array | null>;
  setRoomStateBuffer(roomCode: string, buffer: Uint8Array): Promise<void>;
}

export class RedisAdapterPlaceholder implements IRedisAdapter {
  private readonly isEnabled = false;

  async publishRoomEvent(_roomCode: string, _eventName: string, _payload: unknown): Promise<void> {
    if (!this.isEnabled) return;
    // Future: redisClient.publish(`room:${roomCode}:${eventName}`, JSON.stringify(payload))
  }

  async subscribeRoomEvent(
    _roomCode: string,
    _callback: (eventName: string, payload: unknown) => void,
  ): Promise<void> {
    if (!this.isEnabled) return;
    // Future: redisSubClient.subscribe(`room:${roomCode}:*`, ...)
  }

  async getRoomStateBuffer(_roomCode: string): Promise<Uint8Array | null> {
    return null; // Future: redisClient.getBuffer(`room:${roomCode}:state`)
  }

  async setRoomStateBuffer(_roomCode: string, _buffer: Uint8Array): Promise<void> {
    if (!this.isEnabled) return;
    // Future: redisClient.set(`room:${roomCode}:state`, buffer)
  }
}
