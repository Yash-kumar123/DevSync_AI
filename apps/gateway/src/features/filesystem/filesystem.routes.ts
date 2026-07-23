import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { FolderRepository } from './folder.repository.js';
import { FolderService } from './folder.service.js';
import { FolderController } from './folder.controller.js';
import { FileRepository } from './file.repository.js';
import { FileService } from './file.service.js';
import { FileController } from './file.controller.js';

const folderRepo = new FolderRepository();
const folderService = new FolderService(folderRepo);
const folderController = new FolderController(folderService);

const fileRepo = new FileRepository();
const fileService = new FileService(fileRepo);
const fileController = new FileController(fileService);

export const folderRouter = Router();
folderRouter.use(authenticate);

folderRouter.post('/', folderController.createFolder);
folderRouter.get('/', folderController.getFoldersByWorkspace);
folderRouter.get('/:workspaceId', folderController.getFoldersByWorkspace);
folderRouter.put('/:id', folderController.updateFolder);
folderRouter.delete('/:id', folderController.deleteFolder);

export const fileRouter = Router();
fileRouter.use(authenticate);

fileRouter.post('/', fileController.createFile);
fileRouter.get('/', fileController.getFilesByWorkspace);
fileRouter.get('/detail/:id', fileController.getFileById);
fileRouter.get('/:workspaceId', fileController.getFilesByWorkspace);
fileRouter.put('/:id', fileController.updateFile);
fileRouter.delete('/:id', fileController.deleteFile);
