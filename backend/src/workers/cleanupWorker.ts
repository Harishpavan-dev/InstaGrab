import { downloadService } from '../services/downloadService';
import { logger } from '../utils/logger';
import { config } from '../config';

export function startCleanupWorker(): void {
  const intervalMs = Math.min(config.files.expirationMinutes * 60 * 1000, 5 * 60 * 1000);

  logger.info('Cleanup worker started', {
    intervalMinutes: Math.round(intervalMs / 60000),
    expirationMinutes: config.files.expirationMinutes,
  });

  setInterval(() => {
    try {
      downloadService.cleanupExpiredJobs();
      logger.debug('Cleanup worker ran successfully');
    } catch (error: any) {
      logger.error('Cleanup worker error', { error: error.message });
    }
  }, intervalMs);
}
