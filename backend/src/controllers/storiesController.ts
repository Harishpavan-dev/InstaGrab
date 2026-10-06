import { Request, Response } from 'express';
import { downloadService } from '../services/downloadService';
import { infoSchema, downloadSchema } from '../validators';
import { logger } from '../utils/logger';

export class StoriesController {
  async getInfo(req: Request, res: Response): Promise<void> {
    try {
      const validation = infoSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0]?.message || 'Invalid request.',
          },
        });
        return;
      }

      const { url } = validation.data;
      const info = await downloadService.getVideoInfo(url);

      res.json({
        success: true,
        data: info,
      });
    } catch (error: any) {
      const reqId = (req as any).requestId || 'unknown';
      logger.error('GetInfo controller error', {
        requestId: reqId,
        error: error.message,
      });

      res.status(422).json({
        success: false,
        error: {
          code: 'INFO_FAILED',
          message: error.message || 'Unable to retrieve video information.',
        },
      });
    }
  }

  async startDownload(req: Request, res: Response): Promise<void> {
    try {
      const validation = downloadSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0]?.message || 'Invalid request.',
          },
        });
        return;
      }

      const { url, quality } = validation.data;
      const format = 'mp4';
      const job = await downloadService.createDownloadJob(url, quality, format);

      res.status(202).json({
        success: true,
        data: {
          id: job.id,
          status: job.status,
          message: 'Download job created. Poll /api/download/status/:id for updates.',
        },
      });
    } catch (error: any) {
      const reqId = (req as any).requestId || 'unknown';
      logger.error('StartDownload controller error', {
        requestId: reqId,
        error: error.message,
      });

      res.status(422).json({
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: error.message || 'Unable to process this URL.',
        },
      });
    }
  }

  async getStatus(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    if (!id || id.length > 30) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid job ID.' },
      });
      return;
    }

    const job = downloadService.getJobStatus(id);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Download job not found or has expired.' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: job.id,
        status: job.status,
        platform: job.platform,
        title: job.title,
        progress: job.progress,
        fileSize: job.fileSize,
        fileName: job.fileName,
        error: job.error,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
      },
    });
  }

  async downloadFile(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    if (!id || id.length > 30) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid job ID.' },
      });
      return;
    }

    const fileInfo = downloadService.getJobFilePath(id);
    if (!fileInfo) {
      res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File not found or has expired.' },
      });
      return;
    }

    res.download(fileInfo.filePath, fileInfo.fileName, (err) => {
      if (err) {
        logger.error('File download error', { jobId: id, error: err.message });
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: { code: 'DOWNLOAD_ERROR', message: 'Failed to send file.' },
          });
        }
      }
    });
  }

  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  }
}

export const storiesController = new StoriesController();
