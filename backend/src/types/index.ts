export type Platform = 'instagram';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'expired';

export interface VideoFormat {
  quality: string;
  format: string;
  size: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
  label: string;
}

export interface VideoInfo {
  id: string;
  platform: Platform;
  title: string;
  thumbnail: string;
  duration: number;
  author: string;
  formats: VideoFormat[];
  originalUrl: string;
}

export interface DownloadJob {
  id: string;
  url: string;
  platform: Platform;
  status: JobStatus;
  quality: string;
  format: string;
  title: string;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  progress: number;
  error: string | null;
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface DownloadRequest {
  url: string;
  quality?: string;
  format?: string;
}

export interface InfoRequest {
  url: string;
}
