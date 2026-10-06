import { Router } from 'express';
import { storiesController } from '../controllers/storiesController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => storiesController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => storiesController.startDownload(req, res));
router.get('/status/:id', (req, res) => storiesController.getStatus(req, res));
router.get('/file/:id', (req, res) => storiesController.downloadFile(req, res));

export default router;
