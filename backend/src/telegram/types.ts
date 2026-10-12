export interface TelegramBotSettings {
  bot_enabled: boolean;
  bot_token?: string;
  welcome_message: string;
  max_daily_downloads_per_user: number;
  allowed_formats: string; // 'video,audio' or 'video' or 'audio'
  updated_at?: Date;
}

export interface TelegramLogEntry {
  id?: number;
  telegram_user_id: number;
  telegram_username: string;
  first_name: string;
  requested_url: string;
  format: 'video' | 'audio';
  status: 'success' | 'failed';
  error_message?: string;
  file_size_bytes?: number;
  created_at?: Date;
}

export interface TelegramBotStatus {
  running: boolean;
  uptime: number | null;
  botUsername: string | null;
  totalProcessed: number;
  startedAt: number | null;
}

export interface TelegramAnalytics {
  totalRequests: number;
  todayRequests: number;
  uniqueUsers: number;
  videoDownloads: number;
  audioDownloads: number;
  successRate: number;
  topUsers: { username: string; count: number }[];
}

export interface PendingDownload {
  chatId: number;
  messageId: number;
  url: string;
  userId: number;
  username: string;
  firstName: string;
}
