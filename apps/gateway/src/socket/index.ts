import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { corsOptions } from '../config/cors.js';
import { CollaborationController } from '../features/collaboration/collaboration.controller.js';
import { CollaborationSocketHandler } from '../modules/collaboration/socket/collaboration.socket.js';

// =============================================================================
// DevSync AI — Socket.io Initialization
// Configures WebSocket hub and attaches collaboration event handlers.
// =============================================================================

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const legacyCollaborationController = new CollaborationController();
  const collaborationSocketHandler = new CollaborationSocketHandler();

  io.on('connection', (socket) => {
    legacyCollaborationController.registerHandlers(io, socket);
    collaborationSocketHandler.registerHandlers(io, socket);
  });

  return io;
}
