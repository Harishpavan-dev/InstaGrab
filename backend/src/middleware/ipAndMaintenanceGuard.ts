import { Request, Response, NextFunction } from 'express';
import { isIpBanned } from '../db/mysql';

let maintenanceMode = false;

export function setMaintenanceMode(enabled: boolean): void {
  maintenanceMode = enabled;
}

export function getMaintenanceModeStatus(): boolean {
  return maintenanceMode;
}

export async function ipAndMaintenanceGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress || 'unknown';

  // 1. IP Ban check
  try {
    const isBanned = await isIpBanned(ipAddress);
    if (isBanned) {
      res.status(403).json({
        success: false,
        error: {
          code: 'IP_BANNED',
          message: 'Your IP address has been restricted from accessing this service.',
        },
      });
      return;
    }
  } catch {
    // Continue if DB check fails
  }

  // 2. Maintenance Mode check (always allow admin routes)
  const isAdminRoute = req.path.includes('/admin') || req.originalUrl.includes('/admin');
  if (maintenanceMode && !isAdminRoute) {
    res.status(503).json({
      success: false,
      error: {
        code: 'MAINTENANCE_MODE',
        message: 'InstaGrab is currently undergoing scheduled maintenance. Please try again shortly.',
      },
    });
    return;
  }

  next();
}
