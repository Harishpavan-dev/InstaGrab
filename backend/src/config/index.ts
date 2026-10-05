import dotenv from 'dotenv';
import path from 'path';

// Try backend/.env first then fall back to project root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },

  files: {
    expirationMinutes: parseInt(process.env.FILE_EXPIRATION_MINUTES || '30', 10),
    maxDownloadSizeMB: parseInt(process.env.MAX_DOWNLOAD_SIZE_MB || '500', 10),
    tempDir: path.resolve(process.env.TEMP_DIR || path.join(__dirname, '../../temp')),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    downloadMax: parseInt(process.env.DOWNLOAD_RATE_LIMIT_MAX || '10', 10),
    infoMax: parseInt(process.env.INFO_RATE_LIMIT_MAX || '30', 10),
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3001')
      .split(',')
      .map((o) => o.trim()),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
