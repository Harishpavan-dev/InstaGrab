import mysql from 'mysql2/promise';
import geoip from 'geoip-lite';
import { config } from '../config';
import { logger } from '../utils/logger';
import { TelegramLogEntry, TelegramBotSettings, TelegramAnalytics } from '../telegram/types';

let pool: mysql.Pool | null = null;
let isDbConnected = false;

export interface LogEntry {
  id?: number;
  ip_address: string;
  country?: string;
  user_agent: string;
  tool_type: string;
  requested_url: string;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: Date;
}

export interface BannedIpEntry {
  id?: number;
  ip_address: string;
  reason?: string;
  created_at: Date;
}

const memoryLogs: LogEntry[] = [];
const memoryBannedIps: Set<string> = new Set();
const MAX_MEMORY_LOGS = 1000;

export async function initDb(): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\`;`);
    await connection.end();

    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create download_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        country VARCHAR(10) DEFAULT 'Unknown',
        user_agent TEXT,
        tool_type VARCHAR(20) NOT NULL,
        requested_url TEXT NOT NULL,
        status ENUM('success', 'failed') NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_ip (ip_address)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create banned_ips table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banned_ips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) UNIQUE NOT NULL,
        reason VARCHAR(255) DEFAULT 'Banned by Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create telegram_bot_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telegram_bot_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        telegram_user_id BIGINT NOT NULL,
        telegram_username VARCHAR(255) DEFAULT '',
        first_name VARCHAR(255) DEFAULT '',
        requested_url TEXT NOT NULL,
        format ENUM('video', 'audio') NOT NULL,
        status ENUM('success', 'failed') NOT NULL,
        error_message TEXT,
        file_size_bytes BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tg_created_at (created_at),
        INDEX idx_tg_user_id (telegram_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create telegram_bot_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telegram_bot_settings (
        id INT PRIMARY KEY DEFAULT 1,
        bot_enabled BOOLEAN DEFAULT TRUE,
        bot_token VARCHAR(255) DEFAULT NULL,
        welcome_message TEXT,
        max_daily_downloads_per_user INT DEFAULT 20,
        allowed_formats VARCHAR(50) DEFAULT 'video,audio',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await pool.query(`ALTER TABLE telegram_bot_settings ADD COLUMN bot_token VARCHAR(255) DEFAULT NULL`);
    } catch {}

    // Seed default settings if not exists (use parameterized query to safely handle apostrophes)
    const defaultWelcome = "👋 Hey {{name}}! Welcome to **InstaGrab Bot**!\n\n📥 Just send me an Instagram reel or post link and I'll download it for you.\n\n🎬 You can choose between **Video** or **Audio** format.\n\nTry it now! Paste an Instagram link below 👇";
    await pool.query(
      `INSERT IGNORE INTO telegram_bot_settings (id, bot_enabled, welcome_message, max_daily_downloads_per_user, allowed_formats)
       VALUES (1, TRUE, ?, 20, 'video,audio')`,
      [defaultWelcome]
    );

    isDbConnected = true;
    logger.info('MySQL database connected and tables initialized successfully');
  } catch (error: any) {
    isDbConnected = false;
    logger.warn('MySQL connection failed. Using in-memory store.', { error: error.message });
  }
}

export async function logDownloadActivity(entry: Omit<LogEntry, 'id' | 'created_at' | 'country'>): Promise<void> {
  const geo = geoip.lookup(entry.ip_address);
  const country = geo?.country || 'Unknown';

  const newEntry: LogEntry = {
    ...entry,
    country,
    created_at: new Date(),
  };

  memoryLogs.unshift(newEntry);
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.pop();
  }

  if (isDbConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO download_logs (ip_address, country, user_agent, tool_type, requested_url, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [entry.ip_address, country, entry.user_agent, entry.tool_type, entry.requested_url, entry.status, entry.error_message || null]
      );
    } catch (err: any) {
      logger.error('Failed to insert log into MySQL', { error: err.message });
    }
  }
}

export async function isIpBanned(ip: string): Promise<boolean> {
  if (memoryBannedIps.has(ip)) return true;

  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query('SELECT 1 FROM banned_ips WHERE ip_address = ?', [ip]);
      if (rows.length > 0) {
        memoryBannedIps.add(ip);
        return true;
      }
    } catch (err: any) {
      logger.error('Failed to check banned IP in MySQL', { error: err.message });
    }
  }
  return false;
}

export async function banIp(ip: string, reason?: string): Promise<void> {
  memoryBannedIps.add(ip);

  if (isDbConnected && pool) {
    try {
      await pool.query('INSERT IGNORE INTO banned_ips (ip_address, reason) VALUES (?, ?)', [ip, reason || 'Banned by Admin']);
    } catch (err: any) {
      logger.error('Failed to ban IP in MySQL', { error: err.message });
    }
  }
}

export async function unbanIp(ip: string): Promise<void> {
  memoryBannedIps.delete(ip);

  if (isDbConnected && pool) {
    try {
      await pool.query('DELETE FROM banned_ips WHERE ip_address = ?', [ip]);
    } catch (err: any) {
      logger.error('Failed to unban IP in MySQL', { error: err.message });
    }
  }
}

export async function getBannedIps(): Promise<BannedIpEntry[]> {
  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM banned_ips ORDER BY created_at DESC');
      return rows as BannedIpEntry[];
    } catch (err: any) {
      logger.error('Failed to fetch banned IPs', { error: err.message });
    }
  }

  return Array.from(memoryBannedIps).map((ip) => ({
    ip_address: ip,
    reason: 'Banned by Admin',
    created_at: new Date(),
  }));
}

export async function getDownloadLogs(limit: number = 100, page: number = 1, search?: string): Promise<{ logs: LogEntry[]; total: number }> {
  const offset = (page - 1) * limit;

  if (isDbConnected && pool) {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (search) {
        whereClause = 'WHERE ip_address LIKE ? OR requested_url LIKE ? OR tool_type LIKE ? OR country LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const [countRows]: any = await pool.query(`SELECT COUNT(*) as total FROM download_logs ${whereClause}`, params);
      const total = countRows[0]?.total || 0;

      const [rows]: any = await pool.query(
        `SELECT id, ip_address, country, user_agent, tool_type, requested_url, status, error_message, created_at FROM download_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return { logs: rows as LogEntry[], total };
    } catch (err: any) {
      logger.error('Failed to fetch logs from MySQL', { error: err.message });
    }
  }

  let filtered = memoryLogs;
  if (search) {
    const s = search.toLowerCase();
    filtered = memoryLogs.filter(
      (l) =>
        l.ip_address.toLowerCase().includes(s) ||
        l.requested_url.toLowerCase().includes(s) ||
        l.tool_type.toLowerCase().includes(s) ||
        (l.country || '').toLowerCase().includes(s)
    );
  }

  const paginated = filtered.slice(offset, offset + limit);
  return { logs: paginated, total: filtered.length };
}

export async function getAnalyticsSummary(): Promise<{
  totalDownloads: number;
  totalUniqueUsers: number;
  todayDownloads: number;
  successRatePercent: number;
  topRequestedUrls: { url: string; count: number }[];
  toolBreakdown: Record<string, number>;
  countryBreakdown: { country: string; count: number }[];
}> {
  if (isDbConnected && pool) {
    try {
      const [totalRows]: any = await pool.query('SELECT COUNT(*) as total FROM download_logs');
      const [userRows]: any = await pool.query('SELECT COUNT(DISTINCT ip_address) as unique_users FROM download_logs');
      const [todayRows]: any = await pool.query('SELECT COUNT(*) as today FROM download_logs WHERE DATE(created_at) = CURDATE()');
      const [successRows]: any = await pool.query("SELECT COUNT(*) as success FROM download_logs WHERE status = 'success'");

      const total = totalRows[0]?.total || 0;
      const success = successRows[0]?.success || 0;
      const successRatePercent = total > 0 ? Math.round((success / total) * 100) : 100;

      const [topUrls]: any = await pool.query(
        'SELECT requested_url as url, COUNT(*) as count FROM download_logs GROUP BY requested_url ORDER BY count DESC LIMIT 5'
      );

      const [toolRows]: any = await pool.query('SELECT tool_type, COUNT(*) as count FROM download_logs GROUP BY tool_type');
      const [countryRows]: any = await pool.query(
        'SELECT country, COUNT(*) as count FROM download_logs GROUP BY country ORDER BY count DESC LIMIT 8'
      );

      const toolBreakdown: Record<string, number> = {};
      toolRows.forEach((r: any) => {
        toolBreakdown[r.tool_type] = r.count;
      });

      return {
        totalDownloads: total,
        totalUniqueUsers: userRows[0]?.unique_users || 0,
        todayDownloads: todayRows[0]?.today || 0,
        successRatePercent,
        topRequestedUrls: topUrls,
        toolBreakdown,
        countryBreakdown: countryRows,
      };
    } catch (err: any) {
      logger.error('Failed to fetch analytics from MySQL', { error: err.message });
    }
  }

  const uniqueIPs = new Set(memoryLogs.map((l) => l.ip_address));
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = memoryLogs.filter((l) => l.created_at.toISOString().startsWith(today));
  const successCount = memoryLogs.filter((l) => l.status === 'success').length;
  const successRatePercent = memoryLogs.length > 0 ? Math.round((successCount / memoryLogs.length) * 100) : 100;

  const urlCounts: Record<string, number> = {};
  const toolCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};

  memoryLogs.forEach((l) => {
    urlCounts[l.requested_url] = (urlCounts[l.requested_url] || 0) + 1;
    toolCounts[l.tool_type] = (toolCounts[l.tool_type] || 0) + 1;
    const c = l.country || 'Unknown';
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });

  const topRequestedUrls = Object.entries(urlCounts)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countryBreakdown = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalDownloads: memoryLogs.length,
    totalUniqueUsers: uniqueIPs.size,
    todayDownloads: todayLogs.length,
    successRatePercent,
    topRequestedUrls,
    toolBreakdown: toolCounts,
    countryBreakdown,
  };
}

// ────────────────────── Telegram Bot Functions ──────────────────────

const memoryTelegramLogs: TelegramLogEntry[] = [];
const MAX_MEMORY_TG_LOGS = 500;
let memoryTelegramSettings: TelegramBotSettings = {
  bot_enabled: true,
  welcome_message: '👋 Hey {{name}}! Welcome to InstaGrab Bot!\n\n📥 Just send me an Instagram reel or post link.',
  max_daily_downloads_per_user: 20,
  allowed_formats: 'video,audio',
};

export async function logTelegramActivity(
  entry: Omit<TelegramLogEntry, 'id' | 'created_at'>
): Promise<void> {
  const newEntry: TelegramLogEntry = { ...entry, created_at: new Date() };
  memoryTelegramLogs.unshift(newEntry);
  if (memoryTelegramLogs.length > MAX_MEMORY_TG_LOGS) memoryTelegramLogs.pop();

  if (isDbConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO telegram_bot_logs (telegram_user_id, telegram_username, first_name, requested_url, format, status, error_message, file_size_bytes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.telegram_user_id,
          entry.telegram_username || '',
          entry.first_name || '',
          entry.requested_url,
          entry.format,
          entry.status,
          entry.error_message || null,
          entry.file_size_bytes || 0,
        ]
      );
    } catch (err: any) {
      logger.error('Failed to insert Telegram log into MySQL', { error: err.message });
    }
  }
}

export async function getTelegramLogs(
  limit: number = 50,
  page: number = 1,
  search?: string
): Promise<{ logs: TelegramLogEntry[]; total: number }> {
  const offset = (page - 1) * limit;

  if (isDbConnected && pool) {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (search) {
        whereClause =
          'WHERE telegram_username LIKE ? OR requested_url LIKE ? OR first_name LIKE ?';
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      const [countRows]: any = await pool.query(
        `SELECT COUNT(*) as total FROM telegram_bot_logs ${whereClause}`,
        params
      );
      const total = countRows[0]?.total || 0;

      const [rows]: any = await pool.query(
        `SELECT * FROM telegram_bot_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return { logs: rows as TelegramLogEntry[], total };
    } catch (err: any) {
      logger.error('Failed to fetch Telegram logs from MySQL', { error: err.message });
    }
  }

  let filtered = memoryTelegramLogs;
  if (search) {
    const s = search.toLowerCase();
    filtered = memoryTelegramLogs.filter(
      (l) =>
        (l.telegram_username || '').toLowerCase().includes(s) ||
        l.requested_url.toLowerCase().includes(s) ||
        (l.first_name || '').toLowerCase().includes(s)
    );
  }
  return { logs: filtered.slice(offset, offset + limit), total: filtered.length };
}

export async function getTelegramAnalytics(): Promise<TelegramAnalytics> {
  if (isDbConnected && pool) {
    try {
      const [totalRows]: any = await pool.query('SELECT COUNT(*) as total FROM telegram_bot_logs');
      const [todayRows]: any = await pool.query(
        'SELECT COUNT(*) as today FROM telegram_bot_logs WHERE DATE(created_at) = CURDATE()'
      );
      const [userRows]: any = await pool.query(
        'SELECT COUNT(DISTINCT telegram_user_id) as unique_users FROM telegram_bot_logs'
      );
      const [videoRows]: any = await pool.query(
        "SELECT COUNT(*) as count FROM telegram_bot_logs WHERE format = 'video'"
      );
      const [audioRows]: any = await pool.query(
        "SELECT COUNT(*) as count FROM telegram_bot_logs WHERE format = 'audio'"
      );
      const [successRows]: any = await pool.query(
        "SELECT COUNT(*) as count FROM telegram_bot_logs WHERE status = 'success'"
      );
      const [topUsers]: any = await pool.query(
        `SELECT COALESCE(NULLIF(telegram_username, ''), first_name, CAST(telegram_user_id AS CHAR)) as username, COUNT(*) as count
         FROM telegram_bot_logs GROUP BY telegram_user_id ORDER BY count DESC LIMIT 10`
      );

      const total = totalRows[0]?.total || 0;
      const success = successRows[0]?.count || 0;

      return {
        totalRequests: total,
        todayRequests: todayRows[0]?.today || 0,
        uniqueUsers: userRows[0]?.unique_users || 0,
        videoDownloads: videoRows[0]?.count || 0,
        audioDownloads: audioRows[0]?.count || 0,
        successRate: total > 0 ? Math.round((success / total) * 100 * 10) / 10 : 100,
        topUsers: topUsers.map((r: any) => ({ username: r.username, count: r.count })),
      };
    } catch (err: any) {
      logger.error('Failed to fetch Telegram analytics', { error: err.message });
    }
  }

  // Fallback to in-memory
  const uniqueIds = new Set(memoryTelegramLogs.map((l) => l.telegram_user_id));
  const videos = memoryTelegramLogs.filter((l) => l.format === 'video').length;
  const audios = memoryTelegramLogs.filter((l) => l.format === 'audio').length;
  const successes = memoryTelegramLogs.filter((l) => l.status === 'success').length;
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = memoryTelegramLogs.filter(
    (l) => l.created_at && l.created_at.toISOString().startsWith(today)
  );

  return {
    totalRequests: memoryTelegramLogs.length,
    todayRequests: todayLogs.length,
    uniqueUsers: uniqueIds.size,
    videoDownloads: videos,
    audioDownloads: audios,
    successRate:
      memoryTelegramLogs.length > 0
        ? Math.round((successes / memoryTelegramLogs.length) * 100 * 10) / 10
        : 100,
    topUsers: [],
  };
}

export async function getTelegramSettings(): Promise<TelegramBotSettings | null> {
  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM telegram_bot_settings WHERE id = 1');
      if (rows.length > 0) {
        return rows[0] as TelegramBotSettings;
      }
    } catch (err: any) {
      logger.error('Failed to fetch Telegram settings', { error: err.message });
    }
  }
  return memoryTelegramSettings;
}

export async function updateTelegramSettings(
  settings: Partial<TelegramBotSettings>
): Promise<void> {
  // Update in-memory
  memoryTelegramSettings = { ...memoryTelegramSettings, ...settings };

  if (isDbConnected && pool) {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (settings.bot_enabled !== undefined) {
        fields.push('bot_enabled = ?');
        values.push(settings.bot_enabled);
      }
      if (settings.bot_token !== undefined) {
        fields.push('bot_token = ?');
        values.push(settings.bot_token);
      }
      if (settings.welcome_message !== undefined) {
        fields.push('welcome_message = ?');
        values.push(settings.welcome_message);
      }
      if (settings.max_daily_downloads_per_user !== undefined) {
        fields.push('max_daily_downloads_per_user = ?');
        values.push(settings.max_daily_downloads_per_user);
      }
      if (settings.allowed_formats !== undefined) {
        fields.push('allowed_formats = ?');
        values.push(settings.allowed_formats);
      }

      if (fields.length > 0) {
        await pool.query(
          `UPDATE telegram_bot_settings SET ${fields.join(', ')} WHERE id = 1`,
          values
        );
      }
    } catch (err: any) {
      logger.error('Failed to update Telegram settings', { error: err.message });
    }
  }
}

export async function getUserDailyDownloadCount(userId: number): Promise<number> {
  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT COUNT(*) as count FROM telegram_bot_logs WHERE telegram_user_id = ? AND DATE(created_at) = CURDATE()',
        [userId]
      );
      return rows[0]?.count || 0;
    } catch (err: any) {
      logger.error('Failed to get user daily download count', { error: err.message });
    }
  }

  // Fallback: count from memory
  const today = new Date().toISOString().split('T')[0];
  return memoryTelegramLogs.filter(
    (l) =>
      l.telegram_user_id === userId &&
      l.created_at &&
      l.created_at.toISOString().startsWith(today)
  ).length;
}
