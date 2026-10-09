import { Router } from 'express';
import videoRoutes from './videoRoutes';
import audioRoutes from './audioRoutes';
import photoRoutes from './photoRoutes';
import reelsRoutes from './reelsRoutes';
import storiesRoutes from './storiesRoutes';
import profileRoutes from './profileRoutes';
import adminRoutes from './adminRoutes';
import { downloadController } from '../controllers/downloadController';
import { activityLogger } from '../middleware/activityLogger';

const router = Router();

// Track user IP and requested download URL for research/analytics
router.use(activityLogger);

router.use('/admin', adminRoutes);

router.use('/video', videoRoutes);
router.use('/audio', audioRoutes);
router.use('/photo', photoRoutes);
router.use('/reels', reelsRoutes);
router.use('/stories', storiesRoutes);
router.use('/profile', profileRoutes);

// Fallback old endpoints
router.use('/download', videoRoutes);

router.get('/health', (req, res) => downloadController.healthCheck(req, res));

export default router;
