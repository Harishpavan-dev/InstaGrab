import TelegramBot from 'node-telegram-bot-api';
import { pendingDownloads } from './messageHandler';
import { downloadForTelegram } from '../services/telegramDownload';
import { buildDownloadingMessage, buildSuccessCaption } from '../utils/helpers';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Handle callback queries from inline keyboard buttons (Video/Audio).
 */
export async function handleCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
): Promise<void> {
  if (!query.data || !query.message) return;

  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const key = `${chatId}:${messageId}`;

  // Acknowledge the callback immediately
  await bot.answerCallbackQuery(query.id);

  // Find the pending download
  const pending = pendingDownloads.get(key);
  if (!pending) {
    await bot.editMessageText(
      '⏰ This download request has expired. Please send the link again.',
      { chat_id: chatId, message_id: messageId }
    );
    return;
  }

  // Parse the format choice
  const [action, format] = query.data.split(':');
  if (action !== 'download' || !['video', 'audio'].includes(format)) {
    return;
  }

  const downloadFormat = format as 'video' | 'audio';

  // Remove from pending
  pendingDownloads.delete(key);

  // Update the message to show "Downloading..."
  await bot.editMessageText(buildDownloadingMessage(downloadFormat), {
    chat_id: chatId,
    message_id: messageId,
  });

  try {
    const result = await downloadForTelegram(
      pending.url,
      downloadFormat,
      pending.userId,
      pending.username,
      pending.firstName
    );

    const caption = buildSuccessCaption(
      downloadFormat,
      result.fileSize,
      result.title
    );

    // Send the file
    if (downloadFormat === 'video') {
      await bot.sendVideo(chatId, result.filePath, {
        caption,
      });
    } else {
      // Send as audio
      await bot.sendAudio(chatId, result.filePath, {
        caption,
        title: result.title || 'Instagram Audio',
      });
    }

    // Update the status message
    await bot.editMessageText('✅ Download complete! Enjoy your content. 🎉', {
      chat_id: chatId,
      message_id: messageId,
    });

    // Cleanup the downloaded file after sending
    try {
      const jobDir = path.dirname(result.filePath);
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    } catch {}
  } catch (error: any) {
    logger.error('Telegram download callback error', {
      chatId,
      url: pending.url,
      format: downloadFormat,
      error: error.message,
    });

    const userMessage = error.message.includes('too large')
      ? `❌ ${error.message}`
      : error.message.includes('authentication') || error.message.includes('cookies')
        ? '❌ This post requires authentication. The bot admin needs to update the cookies.'
        : error.message.includes('private')
          ? '❌ This post is private and cannot be accessed.'
          : `❌ Download failed: ${error.message}\n\nPlease try again or try a different link.`;

    await bot.editMessageText(userMessage, {
      chat_id: chatId,
      message_id: messageId,
    });
  }
}
