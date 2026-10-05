import { Router } from 'express';
import { downloadController } from '../controllers/downloadController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => downloadController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => downloadController.startDownload(req, res));
router.get('/status/:id', (req, res) => downloadController.getStatus(req, res));
router.get('/file/:id', (req, res) => downloadController.downloadFile(req, res));

export default router;
