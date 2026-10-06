import { Router } from 'express';
import { reelsController } from '../controllers/reelsController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => reelsController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => reelsController.startDownload(req, res));
router.get('/status/:id', (req, res) => reelsController.getStatus(req, res));
router.get('/file/:id', (req, res) => reelsController.downloadFile(req, res));

export default router;
