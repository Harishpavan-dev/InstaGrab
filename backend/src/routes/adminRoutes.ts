import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Public Admin Route
router.post('/login', adminController.login);

// Protected Admin Routes
router.get('/metrics', adminAuth, adminController.getMetrics);
router.get('/logs', adminAuth, adminController.getLogs);
router.get('/analytics', adminAuth, adminController.getAnalytics);
router.get('/system-logs', adminAuth, adminController.getSystemLogs);

// IP Ban Management
router.get('/banned-ips', adminAuth, adminController.getBannedIpsList);
router.post('/banned-ips', adminAuth, adminController.addBannedIp);
router.delete('/banned-ips/:ip', adminAuth, adminController.removeBannedIp);

// Server Controls & Maintenance
router.post('/maintenance', adminAuth, adminController.toggleMaintenanceMode);
router.post('/clean-temp', adminAuth, adminController.cleanTempFiles);

// Instagram Cookies Manager
router.get('/cookies', adminAuth, adminController.getCookiesStatus);
router.post('/cookies', adminAuth, adminController.updateCookies);

export default router;
