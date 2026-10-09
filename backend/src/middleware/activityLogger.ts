import { Request, Response, NextFunction } from 'express';
import { logDownloadActivity } from '../db/mysql';

export function activityLogger(req: Request, res: Response, next: NextFunction): void {
  // Only log POST requests to API downloader endpoints (e.g., /api/video/info, /api/reels, etc.)
  if (req.method !== 'POST' || !req.body?.url) {
    return next();
  }

  const originalJson = res.json;
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const requestedUrl = req.body.url;

  // Extract tool type from request path (e.g. /api/video/info -> video)
  const pathParts = req.path.split('/').filter(Boolean);
  const toolType = pathParts[0] || 'general';

  // Override res.json to capture response status & success/failure
  res.json = function (body: any): Response {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false;
    const errorMessage = body?.error?.message || (isSuccess ? undefined : 'Request failed');

    // Async log without blocking response
    logDownloadActivity({
      ip_address: ipAddress,
      user_agent: userAgent,
      tool_type: toolType,
      requested_url: requestedUrl,
      status: isSuccess ? 'success' : 'failed',
      error_message: errorMessage,
    }).catch(() => {});

    return originalJson.call(this, body);
  };

  next();
}
