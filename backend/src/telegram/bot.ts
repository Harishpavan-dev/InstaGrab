import TelegramBot from 'node-telegram-bot-api';
import { handleMessage } from './handlers/messageHandler';
import { handleCallback } from './handlers/callbackHandler';
import { getTelegramSettings } from '../db/mysql';
import { logger } from '../utils/logger';

/**
 * Create and configure the Telegram bot instance.
 */
export function createBot(token: string): TelegramBot {
  const bot = new TelegramBot(token, { polling: true });

  // Handle /start command
  bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'there';

    try {
      const settings = await getTelegramSettings();
      const welcomeMsg =
        settings?.welcome_message ||
        `👋 Hey ${firstName}! Welcome to **InstaGrab Bot**!\n\n` +
          `📥 Just send me an Instagram reel or post link and I'll download it for you.\n\n` +
          `🎬 You can choose between **Video** or **Audio** format.\n\n` +
          `Try it now! Paste an Instagram link below 👇`;

      await bot.sendMessage(chatId, welcomeMsg.replace('{{name}}', firstName), {
        parse_mode: 'Markdown',
      });
    } catch (error: any) {
      logger.error('Error in /start handler', { error: error.message });
      await bot.sendMessage(
        chatId,
        `👋 Hey ${firstName}! Send me an Instagram link to get started!`
      );
    }
  });

  // Handle /help command
  bot.onText(/\/help/, async (msg: TelegramBot.Message) => {
    const helpText =
      '📖 **How to use InstaGrab Bot:**\n\n' +
      '1️⃣ Copy an Instagram reel or post link\n' +
      '2️⃣ Paste it here in the chat\n' +
      '3️⃣ Choose **Video** or **Audio**\n' +
      '4️⃣ Wait for the download to complete\n' +
      '5️⃣ Enjoy your content! 🎉\n\n' +
      '**Supported links:**\n' +
      '• Instagram Reels\n' +
      '• Instagram Posts (videos)\n' +
      '• Instagram TV (IGTV)\n\n' +
      '⚠️ *Note: Private posts cannot be downloaded.*';

    await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });

  // Handle all other text messages
  bot.on('message', async (msg: TelegramBot.Message) => {
    // Skip commands (already handled above)
    if (msg.text?.startsWith('/start') || msg.text?.startsWith('/help')) return;
    await handleMessage(bot, msg);
  });

  // Handle inline keyboard callbacks
  bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
    await handleCallback(bot, query);
  });

  // Handle polling errors
  bot.on('polling_error', (error: Error) => {
    logger.error('Telegram polling error', { error: error.message });
  });

  return bot;
}
