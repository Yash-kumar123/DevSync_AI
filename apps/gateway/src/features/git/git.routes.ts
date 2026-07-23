import { Router } from 'express';
import { gitController } from './git.controller.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';

export const gitRouter = Router();

gitRouter.use(authenticate);

gitRouter.get('/status/:workspaceId', gitController.getStatus);
gitRouter.post('/stage', gitController.stageFiles);
gitRouter.post('/unstage', gitController.unstageFiles);
gitRouter.post('/commit', gitController.commit);
gitRouter.post('/push', gitController.push);
gitRouter.post('/pull', gitController.pull);
gitRouter.post('/fetch', gitController.fetchRemote);
gitRouter.get('/branches/:workspaceId', gitController.getBranches);
gitRouter.post('/branch/create', gitController.createBranch);
gitRouter.post('/branch/checkout', gitController.checkoutBranch);
gitRouter.delete('/branch/:workspaceId/:branchName', gitController.deleteBranch);
gitRouter.get('/history/:workspaceId', gitController.getHistory);
gitRouter.get('/diff/:workspaceId', gitController.getDiff);
gitRouter.post('/discard', gitController.discardChanges);
