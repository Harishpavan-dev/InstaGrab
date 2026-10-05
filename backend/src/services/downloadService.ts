import { Platform, VideoInfo, DownloadJob } from '../types';
import { DownloadProvider, InstagramProvider } from './providers';
import { detectPlatform } from '../utils/helpers';
import { config } from '../config';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

export class DownloadService {
  private provider: DownloadProvider;
  private jobs: Map<string, DownloadJob>;

  constructor() {
    this.provider = new InstagramProvider();
    this.jobs = new Map();

    // Ensure temp directory exists
    if (!fs.existsSync(config.files.tempDir)) {
      fs.mkdirSync(config.files.tempDir, { recursive: true });
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const platform = detectPlatform(url);
    if (!platform) {
      throw new Error('Invalid Instagram URL. Please paste a valid Instagram post, reel, or story link.');
    }

    return this.provider.getInfo(url);
  }

  async createDownloadJob(url: string, quality: string = '720p', format: string = 'mp4'): Promise<DownloadJob> {
    const platform = detectPlatform(url);
    if (!platform) {
      throw new Error('Invalid Instagram URL. Please paste a valid Instagram post, reel, or story link.');
    }

    const jobId = nanoid(16);
    const jobDir = path.join(config.files.tempDir, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    const now = Date.now();
    const job: DownloadJob = {
      id: jobId,
      url,
      platform,
      status: 'queued',
      quality,
      format,
      title: '',
      filePath: null,
      fileName: null,
      fileSize: null,
      progress: 0,
      error: null,
      createdAt: now,
      updatedAt: now,
      expiresAt: null,
    };

    this.jobs.set(jobId, job);

    // Process the download asynchronously
    this.processJob(job, jobDir).catch((err) => {
      logger.error('Job processing error', { jobId, error: err.message });
    });

    return job;
  }

  private async processJob(job: DownloadJob, jobDir: string): Promise<void> {
    try {
      job.status = 'processing';
      job.progress = 10;
      job.updatedAt = Date.now();

      // Get info first
      let info: VideoInfo;
      try {
        info = await this.provider.getInfo(job.url);
        job.title = info.title;
        job.progress = 30;
        job.updatedAt = Date.now();
      } catch (infoErr: any) {
        job.status = 'failed';
        job.error = infoErr.message;
        job.updatedAt = Date.now();
        return;
      }

      // Download
      const filePath = await this.provider.download(job.url, jobDir, job.quality, job.format);

      if (!fs.existsSync(filePath)) {
        throw new Error('Downloaded file not found.');
      }

      const stats = fs.statSync(filePath);
      const maxSize = config.files.maxDownloadSizeMB * 1024 * 1024;
      if (stats.size > maxSize) {
        fs.unlinkSync(filePath);
        throw new Error(`File exceeds maximum allowed size of ${config.files.maxDownloadSizeMB}MB.`);
      }

      job.status = 'completed';
      job.filePath = filePath;
      job.fileName = path.basename(filePath);
      job.fileSize = stats.size;
      job.progress = 100;
      job.expiresAt = Date.now() + config.files.expirationMinutes * 60 * 1000;
      job.updatedAt = Date.now();

      logger.info('Download completed', {
        jobId: job.id,
        platform: job.platform,
        fileSize: stats.size,
      });

      // Schedule cleanup
      setTimeout(() => {
        this.cleanupJob(job.id);
      }, config.files.expirationMinutes * 60 * 1000);
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message || 'Download failed.';
      job.progress = 0;
      job.updatedAt = Date.now();

      // Clean up job directory on failure
      try {
        if (fs.existsSync(jobDir)) {
          fs.rmSync(jobDir, { recursive: true, force: true });
        }
      } catch {}

      logger.error('Download job failed', {
        jobId: job.id,
        platform: job.platform,
        error: error.message,
      });
    }
  }

  getJobStatus(jobId: string): DownloadJob | null {
    return this.jobs.get(jobId) || null;
  }

  getJobFilePath(jobId: string): { filePath: string; fileName: string } | null {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'completed' || !job.filePath || !job.fileName) {
      return null;
    }

    if (!fs.existsSync(job.filePath)) {
      job.status = 'expired';
      job.updatedAt = Date.now();
      return null;
    }

    return { filePath: job.filePath, fileName: job.fileName };
  }

  cleanupJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (job.filePath) {
      const jobDir = path.dirname(job.filePath);
      try {
        if (fs.existsSync(jobDir)) {
          fs.rmSync(jobDir, { recursive: true, force: true });
        }
      } catch (err: any) {
        logger.error('Cleanup failed', { jobId, error: err.message });
      }
    }

    job.status = 'expired';
    job.filePath = null;
    job.updatedAt = Date.now();
  }

  cleanupExpiredJobs(): void {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (job.expiresAt && now > job.expiresAt) {
        this.cleanupJob(id);
      }
      // Clear old job records from memory (older than 2 hours)
      if (now - job.createdAt > 2 * 60 * 60 * 1000) {
        this.jobs.delete(id);
      }
    }
  }

  cleanupAllTempFiles(): void {
    try {
      if (fs.existsSync(config.files.tempDir)) {
        const entries = fs.readdirSync(config.files.tempDir);
        for (const entry of entries) {
          const fullPath = path.join(config.files.tempDir, entry);
          try {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } catch {}
        }
      }
    } catch (err: any) {
      logger.error('Failed to clean all temp files', { error: err.message });
    }
  }
}

// Singleton instance
export const downloadService = new DownloadService();
