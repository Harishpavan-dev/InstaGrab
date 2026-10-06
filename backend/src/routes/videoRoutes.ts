import { Router } from 'express';
import { videoController } from '../controllers/videoController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => videoController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => videoController.startDownload(req, res));
router.get('/status/:id', (req, res) => videoController.getStatus(req, res));
router.get('/file/:id', (req, res) => videoController.downloadFile(req, res));

export default router;
