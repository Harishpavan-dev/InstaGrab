import express from 'express';
import { config } from './config';
import { logger } from './utils/logger';
import {
  securityHeaders,
  corsMiddleware,
  generalLimiter,
  requestId,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from './middleware';
import routes from './routes';
import { startCleanupWorker } from './workers/cleanupWorker';
import { downloadService } from './services/downloadService';
import { initDb } from './db/mysql';

import { ipAndMaintenanceGuard } from './middleware/ipAndMaintenanceGuard';

const app = express();

// Trust proxy (for rate limiting behind Nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(corsMiddleware);

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Request tracking
app.use(requestId);
app.use(requestLogger);

// Check IP ban and Maintenance mode
app.use(ipAndMaintenanceGuard);

// General rate limit
app.use(generalLimiter);

// API routes
app.use('/api', routes);

// 404 & error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, async () => {
  logger.info(`Server started on port ${config.port}`, {
    env: config.env,
    tempDir: config.files.tempDir,
    fileExpiration: `${config.files.expirationMinutes} minutes`,
  });

  // Initialize DB connection
  await initDb();

  // Start cleanup worker
  startCleanupWorker();

  // Clean temp files from previous runs
  downloadService.cleanupAllTempFiles();
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed');
    downloadService.cleanupAllTempFiles();
    logger.info('Temp files cleaned up');
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

export default app;
