import { z } from 'zod';

const urlRegex = /^https?:\/\/.+/i;

const dangerousPatterns = [
  /[;&|`$(){}[\]!#]/,
  /\.\.\//,
  /\.\.\\/, 
  /%2e%2e/i,
  /%00/,
  /\x00/,
  /file:\/\//i,
  /ftp:\/\//i,
  /data:/i,
  /javascript:/i,
];

const privateIpPatterns = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/\[::1\]/,
  /^https?:\/\/169\.254\./,
];

function validateUrlSafety(url: string): boolean {
  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) return false;
  }
  for (const pattern of privateIpPatterns) {
    if (pattern.test(url)) return false;
  }
  return true;
}

export const infoSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .max(2048, 'URL is too long')
    .regex(urlRegex, 'Invalid URL format')
    .refine(validateUrlSafety, 'URL contains prohibited characters or targets a private network'),
});

export const downloadSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .max(2048, 'URL is too long')
    .regex(urlRegex, 'Invalid URL format')
    .refine(validateUrlSafety, 'URL contains prohibited characters or targets a private network'),
  quality: z.string().max(20).optional().default('720p'),
  format: z.string().max(10).optional().default('mp4'),
});
