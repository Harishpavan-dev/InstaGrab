import { Router } from 'express';
import { audioController } from '../controllers/audioController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => audioController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => audioController.startDownload(req, res));
router.get('/status/:id', (req, res) => audioController.getStatus(req, res));
router.get('/file/:id', (req, res) => audioController.downloadFile(req, res));

export default router;
