import { describe, it, expect } from 'vitest';
import { infoSchema, downloadSchema } from '../src/validators';

describe('infoSchema', () => {
  it('accepts valid URLs', () => {
    const result = infoSchema.safeParse({ url: 'https://www.youtube.com/watch?v=test123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty URLs', () => {
    const result = infoSchema.safeParse({ url: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid URLs', () => {
    const result = infoSchema.safeParse({ url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects URLs with command injection attempts', () => {
    const result = infoSchema.safeParse({ url: 'https://example.com/; rm -rf /' });
    expect(result.success).toBe(false);
  });

  it('rejects URLs with path traversal', () => {
    const result = infoSchema.safeParse({ url: 'https://example.com/../../etc/passwd' });
    expect(result.success).toBe(false);
  });

  it('rejects private IP URLs (SSRF)', () => {
    expect(infoSchema.safeParse({ url: 'http://localhost/admin' }).success).toBe(false);
    expect(infoSchema.safeParse({ url: 'http://127.0.0.1/admin' }).success).toBe(false);
    expect(infoSchema.safeParse({ url: 'http://192.168.1.1/' }).success).toBe(false);
    expect(infoSchema.safeParse({ url: 'http://10.0.0.1/' }).success).toBe(false);
  });

  it('rejects URLs that are too long', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    const result = infoSchema.safeParse({ url: longUrl });
    expect(result.success).toBe(false);
  });
});

describe('downloadSchema', () => {
  it('accepts valid download request', () => {
    const result = downloadSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=test',
      quality: '720p',
      format: 'mp4',
    });
    expect(result.success).toBe(true);
  });

  it('provides defaults for quality and format', () => {
    const result = downloadSchema.safeParse({ url: 'https://www.youtube.com/watch?v=test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quality).toBe('720p');
      expect(result.data.format).toBe('mp4');
    }
  });

  it('rejects pipe characters in URLs', () => {
    const result = downloadSchema.safeParse({ url: 'https://example.com/video | cat /etc/passwd' });
    expect(result.success).toBe(false);
  });
});
