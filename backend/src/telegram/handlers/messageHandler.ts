import TelegramBot from 'node-telegram-bot-api';
import { extractInstagramUrl } from '../utils/helpers';
import { PendingDownload } from '../types';
import { getTelegramSettings, getUserDailyDownloadCount } from '../../db/mysql';
import { logger } from '../../utils/logger';

// In-memory map of pending downloads keyed by `chatId:messageId`
export const pendingDownloads = new Map<string, PendingDownload>();

/**
 * Handle incoming text messages from Telegram users.
 * Detects Instagram URLs and presents the Video/Audio inline keyboard.
 */
export async function handleMessage(
  bot: TelegramBot,
  msg: TelegramBot.Message
): Promise<void> {
  if (!msg.text || msg.from?.is_bot) return;

  const chatId = msg.chat.id;
  const userId = msg.from?.id || 0;
  const username = msg.from?.username || '';
  const firstName = msg.from?.first_name || 'User';

  // Detect Instagram URL
  const igUrl = extractInstagramUrl(msg.text);

  if (!igUrl) {
    // If not a command and not a URL, send a hint
    if (!msg.text.startsWith('/')) {
      await bot.sendMessage(
        chatId,
        '🔗 Please send me a valid Instagram reel or post link.\n\nExample: `https://www.instagram.com/reel/ABC123/`',
        { parse_mode: 'Markdown' }
      );
    }
    return;
  }

  try {
    // Check rate limit
    const settings = await getTelegramSettings();
    if (settings && settings.max_daily_downloads_per_user > 0) {
      const todayCount = await getUserDailyDownloadCount(userId);
      if (todayCount >= settings.max_daily_downloads_per_user) {
        await bot.sendMessage(
          chatId,
          `⚠️ You've reached your daily download limit (${settings.max_daily_downloads_per_user} downloads/day). Please try again tomorrow!`
        );
        return;
      }
    }

    // Check allowed formats
    const allowedFormats = settings?.allowed_formats || 'video,audio';
    const videoAllowed = allowedFormats.includes('video');
    const audioAllowed = allowedFormats.includes('audio');

    // Build inline keyboard
    const buttons: TelegramBot.InlineKeyboardButton[][] = [[]];
    if (videoAllowed) {
      buttons[0].push({ text: '📹 Video', callback_data: `download:video` });
    }
    if (audioAllowed) {
      buttons[0].push({ text: '🎵 Audio', callback_data: `download:audio` });
    }

    if (buttons[0].length === 0) {
      await bot.sendMessage(chatId, '❌ Downloads are currently disabled by the admin.');
      return;
    }

    const reply = await bot.sendMessage(
      chatId,
      '✨ Instagram link detected! What would you like to download?',
      {
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
    );

    // Store pending download info
    const key = `${chatId}:${reply.message_id}`;
    pendingDownloads.set(key, {
      chatId,
      messageId: reply.message_id,
      url: igUrl,
      userId,
      username,
      firstName,
    });

    // Auto-cleanup after 5 minutes
    setTimeout(() => {
      pendingDownloads.delete(key);
    }, 5 * 60 * 1000);
  } catch (error: any) {
    logger.error('Telegram message handler error', {
      chatId,
      error: error.message,
    });
    await bot.sendMessage(
      chatId,
      '❌ Something went wrong. Please try again later.'
    );
  }
}
