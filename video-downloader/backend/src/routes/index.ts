import { Router } from 'express';
import downloadRoutes from './downloadRoutes';
import { downloadController } from '../controllers/downloadController';

const router = Router();

router.use('/download', downloadRoutes);
router.get('/health', (req, res) => downloadController.healthCheck(req, res));

export default router;
