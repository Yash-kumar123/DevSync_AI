import { Router } from 'express';
import { terminalController } from './terminal.controller.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';

export const terminalRouter = Router();

terminalRouter.post('/run', authenticate, terminalController.runCode);
terminalRouter.post('/kill', authenticate, terminalController.killCode);
