import { Request, Response } from 'express';
import { telegramBotManager } from '../telegram/botManager';
import {
  getTelegramLogs,
  getTelegramAnalytics,
  getTelegramSettings,
  updateTelegramSettings,
} from '../db/mysql';
import { config } from '../config';

export const telegramAdminController = {
  // GET /api/admin/telegram/status
  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = telegramBotManager.getStatus();
      const settings = await getTelegramSettings();
      const token = await telegramBotManager.getEffectiveToken();

      res.json({
        success: true,
        data: {
          ...status,
          botEnabled: settings?.bot_enabled ?? config.telegram.botEnabled,
          botTokenConfigured: !!token,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TG_STATUS_ERROR', message: err.message },
      });
    }
  },

  // POST /api/admin/telegram/toggle
  async toggle(req: Request, res: Response): Promise<void> {
    try {
      const { enabled } = req.body;
      const shouldEnable = Boolean(enabled);

      // Update settings in DB
      await updateTelegramSettings({ bot_enabled: shouldEnable });

      if (shouldEnable) {
        const token = await telegramBotManager.getEffectiveToken();
        if (!token) {
          res.status(400).json({
            success: false,
            error: {
              code: 'NO_TOKEN',
              message:
                'Bot token not configured. Set TELEGRAM_BOT_TOKEN in .env or configure in Bot Settings.',
            },
          });
          return;
        }
        if (!telegramBotManager.isRunning()) {
          await telegramBotManager.start(token);
        }
      } else {
        if (telegramBotManager.isRunning()) {
          await telegramBotManager.stop();
        }
      }

      const status = telegramBotManager.getStatus();
      res.json({
        success: true,
        data: status,
        message: `Telegram bot is now ${shouldEnable ? 'ENABLED' : 'DISABLED'}.`,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TG_TOGGLE_ERROR', message: err.message },
      });
    }
  },

  // POST /api/admin/telegram/restart
  async restart(_req: Request, res: Response): Promise<void> {
    try {
      const token = await telegramBotManager.getEffectiveToken();
      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Bot token not configured.',
          },
        });
        return;
      }

      await telegramBotManager.restart();
      const status = telegramBotManager.getStatus();

      res.json({
        success: true,
        data: status,
        message: 'Telegram bot restarted successfully.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TG_RESTART_ERROR', message: err.message },
      });
    }
  },

  // GET /api/admin/telegram/settings
  async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await getTelegramSettings();
      const token = await telegramBotManager.getEffectiveToken();
      res.json({
        success: true,
        data: {
          settings,
          botTokenConfigured: !!token,
          maxFileSize: config.telegram.maxFileSize,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TG_SETTINGS_ERROR', message: err.message },
      });
    }
  },

  // PUT /api/admin/telegram/settings
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const {
        bot_token,
        welcome_message,
        max_daily_downloads_per_user,
        allowed_formats,
      } = req.body;

      const updates: Record<string, any> = {};
      if (bot_token !== undefined && bot_token.trim()) {
        updates.bot_token = bot_token.trim();
      }
      if (welcome_message !== undefined) updates.welcome_message = welcome_message;
      if (max_daily_downloads_per_user !== undefined)
        updates.max_daily_downloads_per_user = Number(max_daily_downloads_per_user);
      if (allowed_formats !== undefined) updates.allowed_formats = allowed_formats;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_UPDATES', message: 'No settings to update.' },
        });
        return;
      }

      await updateTelegramSettings(updates);
      const settings = await getTelegramSettings();

      // If token updated and bot is running, restart with new token
      if (updates.bot_token && telegramBotManager.isRunning()) {
        await telegramBotManager.restart();
      }

      res.json({
        success: true,
        data: { settings },
        message: 'Telegram bot settings updated successfully.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TG_UPDATE_SETTINGS_ERROR', message: err.message },
      });
    }
  },

  // GET /api/admin/telegram/logs
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const search = (req.query.search as string) || undefined;

      const result = await getTelegramLogs(limit, page, search);

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
        error: { code: 'TG_LOGS_ERROR', message: err.message },
      });
    }
  },

  // GET /api/admin/telegram/analytics
  async getAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      const analytics = await getTelegramAnalytics();
      res.json({
        success: true,
        data: analytics,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TG_ANALYTICS_ERROR', message: err.message },
      });
    }
  },
};
