import TelegramBot from 'node-telegram-bot-api';
import { createBot } from './bot';
import { config } from '../config';
import { logger } from '../utils/logger';
import { TelegramBotStatus } from './types';
import { getTelegramSettings } from '../db/mysql';

/**
 * Manages the lifecycle of the Telegram bot (start, stop, restart, status).
 * Singleton — only one bot instance runs at a time.
 */
class TelegramBotManager {
  private bot: TelegramBot | null = null;
  private startedAt: number | null = null;
  private totalProcessed: number = 0;
  private botUsername: string | null = null;

  /**
   * Determine the effective bot token from DB, config, or env.
   */
  async getEffectiveToken(): Promise<string> {
    try {
      const dbSettings = await getTelegramSettings();
      if (dbSettings?.bot_token && dbSettings.bot_token.trim()) {
        return dbSettings.bot_token.trim();
      }
    } catch {}

    if (config.telegram?.botToken && config.telegram.botToken.trim()) {
      return config.telegram.botToken.trim();
    }

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.trim()) {
      return process.env.TELEGRAM_BOT_TOKEN.trim();
    }

    return '';
  }

  /**
   * Start the Telegram bot with polling.
   */
  async start(overrideToken?: string): Promise<void> {
    const token = overrideToken || (await this.getEffectiveToken());

    if (!token) {
      logger.warn('Telegram bot token not configured. Bot will not start.');
      return;
    }

    if (this.bot) {
      logger.warn('Telegram bot is already running. Call stop() first.');
      return;
    }

    try {
      this.bot = createBot(token);

      // Get bot info
      const me = await this.bot.getMe();
      this.botUsername = me.username || null;
      this.startedAt = Date.now();
      this.totalProcessed = 0;

      logger.info(`Telegram bot started: @${this.botUsername}`);
    } catch (error: any) {
      logger.error('Failed to start Telegram bot', { error: error.message });
      this.bot = null;
      this.startedAt = null;
      throw error;
    }
  }

  /**
   * Gracefully stop the Telegram bot.
   */
  async stop(): Promise<void> {
    if (!this.bot) {
      logger.info('Telegram bot is not running.');
      return;
    }

    try {
      await this.bot.stopPolling();
      logger.info('Telegram bot stopped.');
    } catch (error: any) {
      logger.error('Error stopping Telegram bot', { error: error.message });
    } finally {
      this.bot = null;
      this.startedAt = null;
      this.botUsername = null;
    }
  }

  /**
   * Restart the Telegram bot.
   */
  async restart(): Promise<void> {
    await this.stop();
    // Small delay to ensure clean teardown
    await new Promise((r) => setTimeout(r, 1000));
    await this.start();
  }

  /**
   * Get the current status of the bot.
   */
  getStatus(): TelegramBotStatus {
    const now = Date.now();
    return {
      running: this.bot !== null,
      uptime: this.startedAt ? Math.floor((now - this.startedAt) / 1000) : null,
      botUsername: this.botUsername,
      totalProcessed: this.totalProcessed,
      startedAt: this.startedAt,
    };
  }

  /**
   * Increment the processed count (called after each download).
   */
  incrementProcessed(): void {
    this.totalProcessed++;
  }

  /**
   * Check if the bot is running.
   */
  isRunning(): boolean {
    return this.bot !== null;
  }
}

// Singleton export
export const telegramBotManager = new TelegramBotManager();
