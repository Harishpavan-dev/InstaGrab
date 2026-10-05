import { DownloadProvider } from './base';
import { VideoInfo, VideoFormat } from '../../types';
import { logger } from '../../utils/logger';
import { nanoid } from 'nanoid';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

interface YtDlpVideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  uploader_id: string;
  formats: Array<{
    format_id: string;
    ext: string;
    width?: number;
    height?: number;
    filesize?: number;
    filesize_approx?: number;
    acodec?: string;
    vcodec?: string;
    format_note?: string;
    url?: string;
  }>;
  url?: string;
  webpage_url: string;
  extractor: string;
}

export class InstagramProvider implements DownloadProvider {
  private cookiesPath: string;

  constructor() {
    // Check multiple possible cookie file locations
    const possiblePaths = [
      '/app/cookies/cookies.txt',
      path.resolve(__dirname, '../../../cookies/cookies.txt'),
      path.resolve(process.cwd(), 'cookies/cookies.txt'),
    ];

    this.cookiesPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        this.cookiesPath = p;
        logger.info('Found cookies file at: ' + p);
        break;
      }
    }

    if (!this.cookiesPath) {
      logger.warn('No cookies.txt found. Instagram downloads may fail without authentication. Place a Netscape-format cookies.txt in the cookies/ directory.');
    }
  }

  private runYtDlp(args: string[], timeoutMs: number = 60000): Promise<string> {
    return new Promise((resolve, reject) => {
      const fullArgs = [
        '--no-warnings',
        '--no-check-certificates',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ...args,
      ];

      // Add cookies if available
      if (this.cookiesPath && fs.existsSync(this.cookiesPath)) {
        fullArgs.unshift('--cookies', this.cookiesPath);
      }

      logger.info('Running yt-dlp', { args: fullArgs.filter(a => !a.includes('cookie')).join(' '), timeoutMs });

      execFile('yt-dlp', fullArgs, {
        timeout: timeoutMs,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs
      }, (error, stdout, stderr) => {
        if (error) {
          logger.error('yt-dlp error', { stderr, message: error.message });

          // Check if it was a timeout (killed by signal)
          if ((error as any).killed || error.message.includes('TIMEOUT') || error.message.includes('SIGTERM')) {
            reject(new Error('Download timed out. The file may be too large or the connection is slow. Please try again.'));
          } else if (stderr?.includes('not granting access') || stderr?.includes('login required') || stderr?.includes('Login required') || stderr?.includes('empty media response')) {
            reject(new Error('Instagram requires authentication. Please add a valid cookies.txt file to the cookies directory.'));
          } else if (stderr?.includes('Private') || stderr?.includes('private')) {
            reject(new Error('This post is private and cannot be accessed.'));
          } else if (stderr?.includes('not exist') || stderr?.includes('Unsupported URL') || stderr?.includes('Unable to extract')) {
            reject(new Error('Invalid or unavailable Instagram URL. Please check the link and try again.'));
          } else {
            reject(new Error('Failed to fetch video information. Make sure the post is public and the URL is valid.'));
          }
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  async getInfo(url: string): Promise<VideoInfo> {
    try {
      const output = await this.runYtDlp([
        '--dump-json',
        '--no-download',
        url,
      ], 60000); // 60 second timeout for info fetch

      const data: YtDlpVideoInfo = JSON.parse(output);

      const formats: VideoFormat[] = [];
      const seen = new Set<string>();

      if (data.formats && data.formats.length > 0) {
        for (const f of data.formats) {
          const hasVideo = f.vcodec !== 'none' && !!f.vcodec;
          const hasAudio = f.acodec !== 'none' && !!f.acodec;
          
          if (!hasVideo && !hasAudio) continue;

          const height = f.height || 0;
          const quality = height > 0 ? `${height}p` : 'default';
          const ext = f.ext || 'mp4';
          const key = `${quality}-${ext}-${hasAudio ? 'a' : ''}${hasVideo ? 'v' : ''}`;

          if (seen.has(key)) continue;
          seen.add(key);

          const size = f.filesize || f.filesize_approx || null;
          const label = `${quality} ${ext}${hasAudio && hasVideo ? '' : hasAudio ? ' (audio only)' : ' (video only)'}`;

          formats.push({ quality, format: ext, size, hasAudio, hasVideo, label });
        }

        // Sort by quality descending
        formats.sort((a, b) => {
          const aRes = parseInt(a.quality) || 0;
          const bRes = parseInt(b.quality) || 0;
          return bRes - aRes;
        });
      }

      // If no formats found, add a default
      if (formats.length === 0) {
        formats.push({
          quality: 'best',
          format: 'mp4',
          size: null,
          hasAudio: true,
          hasVideo: true,
          label: 'Best Quality (mp4)',
        });
      }

      return {
        id: nanoid(12),
        platform: 'instagram',
        title: data.title || data.description?.slice(0, 80) || 'Instagram Post',
        thumbnail: data.thumbnail || '',
        duration: data.duration || 0,
        author: data.uploader || data.uploader_id || 'Unknown',
        formats,
        originalUrl: url,
      };
    } catch (error: any) {
      logger.error('Instagram getInfo failed', { url, error: error.message });
      throw error;
    }
  }

  async download(url: string, outputDir: string, quality: string, format: string): Promise<string> {
    try {
      const outputTemplate = path.join(outputDir, `instagram_${nanoid(8)}.%(ext)s`);

      const args: string[] = [
        '-o', outputTemplate,
        '--no-playlist',
        '--merge-output-format', format || 'mp4',
      ];

      // Select quality
      if (quality && quality !== 'best' && quality !== 'default') {
        const height = parseInt(quality);
        if (height > 0) {
          args.push('-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`);
        } else {
          args.push('-f', 'best');
        }
      } else {
        args.push('-f', 'best');
      }

      args.push(url);

      await this.runYtDlp(args, 600000); // 10 minute timeout for actual download

      // Find the downloaded file
      const files = fs.readdirSync(outputDir);
      if (files.length === 0) {
        throw new Error('Download completed but no file was created.');
      }

      // Return the most recently created file
      const filePaths = files.map(f => ({
        name: f,
        path: path.join(outputDir, f),
        time: fs.statSync(path.join(outputDir, f)).mtimeMs,
      }));
      filePaths.sort((a, b) => b.time - a.time);

      return filePaths[0].path;
    } catch (error: any) {
      logger.error('Instagram download failed', { url, error: error.message });
      throw error;
    }
  }
}
