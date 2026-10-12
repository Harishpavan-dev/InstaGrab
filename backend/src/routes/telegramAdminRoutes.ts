import { Router } from 'express';
import { telegramAdminController } from '../controllers/telegramAdminController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

// Bot status & controls
router.get('/status', telegramAdminController.getStatus);
router.post('/toggle', telegramAdminController.toggle);
router.post('/restart', telegramAdminController.restart);

// Bot settings
router.get('/settings', telegramAdminController.getSettings);
router.put('/settings', telegramAdminController.updateSettings);

// Telegram logs & analytics
router.get('/logs', telegramAdminController.getLogs);
router.get('/analytics', telegramAdminController.getAnalytics);

export default router;
