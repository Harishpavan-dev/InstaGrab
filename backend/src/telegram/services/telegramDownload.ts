import { downloadService } from '../../services/downloadService';
import { logTelegramActivity } from '../../db/mysql';
import { logger } from '../../utils/logger';
import { config } from '../../config';
import { TelegramLogEntry } from '../types';
import fs from 'fs';

interface TelegramDownloadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  title: string;
}

/**
 * Download an Instagram post for Telegram delivery.
 * Wraps the existing DownloadService and adds Telegram-specific logic.
 */
export async function downloadForTelegram(
  url: string,
  format: 'video' | 'audio',
  userId: number,
  username: string,
  firstName: string
): Promise<TelegramDownloadResult> {
  const ytFormat = format === 'audio' ? 'mp3' : 'mp4';
  const maxTelegramSize = (config.telegram?.maxFileSize || 50) * 1024 * 1024; // Telegram 50MB limit

  try {
    // Create a download job using existing service
    const job = await downloadService.createDownloadJob(url, 'best', ytFormat);

    // Poll for completion (max 3 minutes)
    const maxWait = 180_000;
    const pollInterval = 1500;
    let waited = 0;

    while (waited < maxWait) {
      await new Promise((r) => setTimeout(r, pollInterval));
      waited += pollInterval;

      const status = downloadService.getJobStatus(job.id);
      if (!status) {
        throw new Error('Download job disappeared unexpectedly.');
      }

      if (status.status === 'completed') {
        const fileInfo = downloadService.getJobFilePath(job.id);
        if (!fileInfo) {
          throw new Error('Download completed but file not found.');
        }

        const stats = fs.statSync(fileInfo.filePath);

        // Check Telegram file size limit
        if (stats.size > maxTelegramSize) {
          // Cleanup the oversized file
          downloadService.cleanupJob(job.id);
          throw new Error(
            `File is too large for Telegram (${(stats.size / 1024 / 1024).toFixed(1)}MB). Telegram allows max 50MB.`
          );
        }

        // Log success
        await logTelegramDownload({
          telegram_user_id: userId,
          telegram_username: username,
          first_name: firstName,
          requested_url: url,
          format,
          status: 'success',
          file_size_bytes: stats.size,
        });

        return {
          filePath: fileInfo.filePath,
          fileName: fileInfo.fileName,
          fileSize: stats.size,
          title: status.title || 'Instagram Post',
        };
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Download failed.');
      }
    }

    // Timeout
    downloadService.cleanupJob(job.id);
    throw new Error('Download timed out after 3 minutes. Please try again.');
  } catch (error: any) {
    // Log failure
    await logTelegramDownload({
      telegram_user_id: userId,
      telegram_username: username,
      first_name: firstName,
      requested_url: url,
      format,
      status: 'failed',
      error_message: error.message,
    });

    throw error;
  }
}

async function logTelegramDownload(
  entry: Omit<TelegramLogEntry, 'id' | 'created_at'>
): Promise<void> {
  try {
    await logTelegramActivity(entry);
  } catch (err: any) {
    logger.error('Failed to log Telegram download activity', {
      error: err.message,
    });
  }
}
