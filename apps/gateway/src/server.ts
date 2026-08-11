import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { createSocketServer } from './socket/index.js';

const app = createApp();
const httpServer = createServer(app);

// Extend HTTP server timeouts (120 seconds) to handle Render cold starts and initial DB connections
httpServer.requestTimeout = 120000;
httpServer.headersTimeout = 120000;

createSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.info(`Gateway listening on port ${env.port}`);
});
