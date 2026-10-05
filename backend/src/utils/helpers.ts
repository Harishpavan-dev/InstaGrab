import { Platform } from '../types';

const instagramPatterns: RegExp[] = [
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/[\w-]+/i,
  /^https?:\/\/(www\.)?instagram\.com\/stories\/[\w.-]+\/\d+/i,
];

export function detectPlatform(url: string): Platform | null {
  for (const pattern of instagramPatterns) {
    if (pattern.test(url)) {
      return 'instagram';
    }
  }
  return null;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, '_')
    .substring(0, 200)
    .trim();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
