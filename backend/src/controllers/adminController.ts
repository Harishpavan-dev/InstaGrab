import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import si from 'systeminformation';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { getDownloadLogs, getAnalyticsSummary, getBannedIps, banIp, unbanIp } from '../db/mysql';
import { setMaintenanceMode, getMaintenanceModeStatus } from '../middleware/ipAndMaintenanceGuard';
import { downloadService } from '../services/downloadService';

export const adminController = {
  // POST /api/admin/login
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (username === config.admin.username && password === config.admin.password) {
      const token = jwt.sign({ username }, config.admin.secretKey, { expiresIn: '24h' });
      res.json({
        success: true,
        data: {
          token,
          username,
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid admin username or password.' },
    });
  },

  // GET /api/admin/metrics
  async getMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const [cpuLoad, mem, fsSize, time] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.time(),
      ]);

      const mainFs = fsSize[0] || { size: 0, used: 0, use: 0 };
      const nodeMem = process.memoryUsage();

      res.json({
        success: true,
        data: {
          cpu: {
            currentLoad: Math.round(cpuLoad.currentLoad),
            cores: cpuLoad.cpus?.length || 1,
          },
          memory: {
            totalMB: Math.round(mem.total / 1024 / 1024),
            usedMB: Math.round(mem.active / 1024 / 1024),
            freeMB: Math.round(mem.free / 1024 / 1024),
            usagePercent: Math.round((mem.active / mem.total) * 100),
          },
          storage: {
            totalGB: Math.round(mainFs.size / 1024 / 1024 / 1024),
            usedGB: Math.round(mainFs.used / 1024 / 1024 / 1024),
            usagePercent: Math.round(mainFs.use || 0),
          },
          system: {
            uptimeSeconds: time.uptime,
            nodeVersion: process.version,
            platform: process.platform,
            nodeMemoryMB: Math.round(nodeMem.rss / 1024 / 1024),
            maintenanceMode: getMaintenanceModeStatus(),
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'METRICS_ERROR', message: err.message },
      });
    }
  },

  // GET /api/admin/logs
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const search = (req.query.search as string) || undefined;

      const result = await getDownloadLogs(limit, page, search);

      res.json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit) || 1,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LOGS_ERROR', message: err.message },
      });
    }
  },

  // GET /api/admin/analytics
  async getAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      const summary = await getAnalyticsSummary();
      res.json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ANALYTICS_ERROR', message: err.message },
      });
    }
  },

  // GET /api/admin/banned-ips
  async getBannedIpsList(_req: Request, res: Response): Promise<void> {
    try {
      const list = await getBannedIps();
      res.json({ success: true, data: { bannedIps: list } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'BANNED_IPS_ERROR', message: err.message } });
    }
  },

  // POST /api/admin/banned-ips
  async addBannedIp(req: Request, res: Response): Promise<void> {
    try {
      const { ip, reason } = req.body;
      if (!ip) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'IP address is required.' } });
        return;
      }
      await banIp(ip, reason);
      res.json({ success: true, message: `IP ${ip} has been banned.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'BAN_ERROR', message: err.message } });
    }
  },

  // DELETE /api/admin/banned-ips/:ip
  async removeBannedIp(req: Request, res: Response): Promise<void> {
    try {
      const ip = Array.isArray(req.params.ip) ? req.params.ip[0] : req.params.ip;
      await unbanIp(ip);
      res.json({ success: true, message: `IP ${ip} has been unbanned.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'UNBAN_ERROR', message: err.message } });
    }
  },

  // POST /api/admin/maintenance
  async toggleMaintenanceMode(req: Request, res: Response): Promise<void> {
    const { enabled } = req.body;
    setMaintenanceMode(Boolean(enabled));
    res.json({
      success: true,
      data: { maintenanceMode: getMaintenanceModeStatus() },
      message: `Maintenance mode is now ${enabled ? 'ENABLED' : 'DISABLED'}.`,
    });
  },

  // POST /api/admin/clean-temp
  async cleanTempFiles(_req: Request, res: Response): Promise<void> {
    try {
      await downloadService.cleanupAllTempFiles();
      res.json({ success: true, message: 'All temporary downloaded files have been cleaned up.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'CLEANUP_ERROR', message: err.message } });
    }
  },

  // GET /api/admin/cookies
  async getCookiesStatus(_req: Request, res: Response): Promise<void> {
    try {
      const cookiePath = path.resolve(__dirname, '../../cookies/instagram.txt');
      const rootCookiePath = path.resolve(__dirname, '../../../cookies/instagram.txt');

      let targetPath = fs.existsSync(cookiePath) ? cookiePath : fs.existsSync(rootCookiePath) ? rootCookiePath : null;

      if (!targetPath) {
        res.json({
          success: true,
          data: { exists: false, message: 'No instagram cookies file found.' },
        });
        return;
      }

      const stats = fs.statSync(targetPath);
      const content = fs.readFileSync(targetPath, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#')).length;

      res.json({
        success: true,
        data: {
          exists: true,
          filePath: targetPath,
          sizeBytes: stats.size,
          activeCookieLines: lines,
          lastModified: stats.mtime,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'COOKIES_ERROR', message: err.message } });
    }
  },

  // POST /api/admin/cookies
  async updateCookies(req: Request, res: Response): Promise<void> {
    try {
      const { cookiesContent } = req.body;

      if (!cookiesContent || typeof cookiesContent !== 'string') {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Cookies content string required.' } });
        return;
      }

      const dirPath = path.resolve(__dirname, '../../cookies');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const cookiePath = path.join(dirPath, 'instagram.txt');
      fs.writeFileSync(cookiePath, cookiesContent, 'utf8');

      res.json({
        success: true,
        message: 'Instagram cookies file updated successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'UPDATE_COOKIES_ERROR', message: err.message } });
    }
  },

  // GET /api/admin/system-logs
  async getSystemLogs(req: Request, res: Response): Promise<void> {
    try {
      const logType = (req.query.type as string) === 'error' ? 'error.log' : 'combined.log';
      const logFilePath = path.resolve(__dirname, '../../logs', logType);

      if (!fs.existsSync(logFilePath)) {
        res.json({
          success: true,
          data: { logs: ['No system logs recorded yet.'] },
        });
        return;
      }

      const fileContent = fs.readFileSync(logFilePath, 'utf8');
      const lines = fileContent.trim().split('\n').filter(Boolean);
      const recentLines = lines.slice(-100);

      res.json({
        success: true,
        data: { logs: recentLines },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SYSTEM_LOGS_ERROR', message: err.message },
      });
    }
  },
};
