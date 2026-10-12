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

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'instagrab',
    password: process.env.DB_PASSWORD || 'dev_password_change_me',
    database: process.env.DB_NAME || 'instagrab_db',
  },

  admin: {
    secretKey: process.env.ADMIN_JWT_SECRET || 'dev_jwt_secret_change_in_production',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'change_me_in_env',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botEnabled: process.env.TELEGRAM_BOT_ENABLED === 'true',
    maxFileSize: parseInt(process.env.TELEGRAM_MAX_FILE_SIZE_MB || '50', 10),
    welcomeMessage:
      process.env.TELEGRAM_WELCOME_MSG ||
      '👋 Hey {{name}}! Welcome to InstaGrab Bot!\n\n📥 Just send me an Instagram reel or post link and I\'ll download it for you.\n\n🎬 You can choose between Video or Audio format.\n\nTry it now! Paste an Instagram link below 👇',
  },
} as const;
