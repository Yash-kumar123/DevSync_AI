import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { createSocketServer } from './socket/index.js';

const app = createApp();
const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.info(`Gateway listening on port ${env.port}`);
});
