import { Router } from 'express';
import { photoController } from '../controllers/photoController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => photoController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => photoController.startDownload(req, res));
router.get('/status/:id', (req, res) => photoController.getStatus(req, res));
router.get('/file/:id', (req, res) => photoController.downloadFile(req, res));

export default router;
