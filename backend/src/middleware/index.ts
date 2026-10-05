import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';

// Request ID middleware
export function requestId(req: Request, _res: Response, next: NextFunction): void {
  (req as any).requestId = nanoid(10);
  next();
}

// Request logger
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const reqId = (req as any).requestId || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      requestId: reqId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
}

// Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests

    if (config.env === 'development') {
      return callback(null, true);
    }

    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400,
});

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
  keyGenerator: (req) => req.ip || 'unknown',
});

// Download rate limiter (stricter)
export const downloadLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.downloadMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'DOWNLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many download requests. Please wait before trying again.',
    },
  },
  keyGenerator: (req) => req.ip || 'unknown',
});

// Info rate limiter
export const infoLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.infoMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'INFO_RATE_LIMIT_EXCEEDED',
      message: 'Too many info requests. Please wait before trying again.',
    },
  },
  keyGenerator: (req) => req.ip || 'unknown',
});

// Error handler
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const reqId = (req as any).requestId || 'unknown';
  logger.error('Unhandled error', {
    requestId: reqId,
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  });
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
}

// Request size limit (JSON body)
export const bodySizeLimit = (limit: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const bytes = parseInt(contentLength, 10);
      const maxBytes = parseSize(limit);
      if (bytes > maxBytes) {
        res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request body is too large.',
          },
        });
        return;
      }
    }
    next();
  };
};

function parseSize(size: string): number {
  const units: Record<string, number> = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824 };
  const match = size.match(/^(\d+)(b|kb|mb|gb)$/i);
  if (!match) return 1048576; // default 1MB
  return parseInt(match[1]) * (units[match[2].toLowerCase()] || 1);
}
