import { describe, it, expect } from 'vitest';
import { detectPlatform, sanitizeFilename, formatBytes, formatDuration } from '../src/utils/helpers';

describe('detectPlatform', () => {
  it('detects Instagram post URLs', () => {
    expect(detectPlatform('https://www.instagram.com/p/ABC123/')).toBe('instagram');
    expect(detectPlatform('https://instagram.com/reel/ABC123/')).toBe('instagram');
  });

  it('detects Instagram story URLs', () => {
    expect(detectPlatform('https://www.instagram.com/stories/user/1234567890')).toBe('instagram');
  });

  it('returns null for unsupported URLs', () => {
    expect(detectPlatform('https://www.google.com')).toBeNull();
    expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(detectPlatform('https://www.tiktok.com/@user/video/1234567890')).toBeNull();
    expect(detectPlatform('https://twitter.com/status/123')).toBeNull();
    expect(detectPlatform('not-a-url')).toBeNull();
  });
});

describe('sanitizeFilename', () => {
  it('removes dangerous characters', () => {
    expect(sanitizeFilename('test<>:"/\\|?*file')).toBe('testfile');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('my video title')).toBe('my_video_title');
  });

  it('truncates long filenames', () => {
    const longName = 'a'.repeat(300);
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(200);
  });

  it('removes double dots', () => {
    expect(sanitizeFilename('test..file')).toBe('test.file');
  });
});

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});

describe('formatDuration', () => {
  it('formats seconds into mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});
