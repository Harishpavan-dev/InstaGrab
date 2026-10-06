import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { downloadLimiter, infoLimiter } from '../middleware';

const router = Router();

router.post('/info', infoLimiter, (req, res) => profileController.getInfo(req, res));
router.post('/', downloadLimiter, (req, res) => profileController.startDownload(req, res));
router.get('/status/:id', (req, res) => profileController.getStatus(req, res));
router.get('/file/:id', (req, res) => profileController.downloadFile(req, res));

export default router;
