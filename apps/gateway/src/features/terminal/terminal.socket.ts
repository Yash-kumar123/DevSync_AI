import type { Server, Socket } from 'socket.io';
import { terminalService } from './terminal.service.js';

export function registerTerminalSocketHandlers(io: Server): void {
  const terminalNamespace = io.of('/terminal');

  terminalNamespace.on('connection', (socket: Socket) => {
    socket.on('terminal:create', (data: { workspaceId: string }) => {
      const room = `terminal:${data.workspaceId || 'default'}`;
      socket.join(room);
      socket.emit('terminal:created', { workspaceId: data.workspaceId, status: 'ready' });
    });

    socket.on(
      'terminal:run',
      async (payload: {
        workspaceId: string;
        fileName: string;
        language: string;
        code: string;
      }) => {
        const room = `terminal:${payload.workspaceId || 'default'}`;

        socket.emit('terminal:status', { status: 'running' });

        const result = await terminalService.runCode(payload, (chunk: string) => {
          terminalNamespace.to(room).emit('terminal:output', { data: chunk });
        });

        socket.emit('terminal:status', {
          status: result.status,
          exitCode: result.exitCode,
          durationMs: result.durationMs,
        });
      },
    );

    socket.on('terminal:kill', (data: { workspaceId: string }) => {
      const killed = terminalService.killCode(data.workspaceId || 'default');
      socket.emit('terminal:status', { status: 'killed', killed });
    });
  });
}
