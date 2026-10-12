/**
 * Instagram URL patterns to detect valid IG links from Telegram messages.
 */
const instagramUrlRegex =
  /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|audio|reels\/audio)\/[\w-]+/gi;

/**
 * Extract the first Instagram URL from a message text.
 */
export function extractInstagramUrl(text: string): string | null {
  const matches = text.match(instagramUrlRegex);
  return matches ? matches[0] : null;
}

/**
 * Format file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate a string to maxLen characters and append ellipsis if needed.
 */
export function truncate(str: string, maxLen: number = 60): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

/**
 * Build a success caption for the sent media.
 */
export function buildSuccessCaption(
  format: 'video' | 'audio',
  fileSize: number,
  title?: string
): string {
  const emoji = format === 'video' ? '🎬' : '🎵';
  const sizeStr = formatFileSize(fileSize);
  const titleStr = title ? `\n📝 ${truncate(title)}` : '';
  return `${emoji} Here's your ${format}! (${sizeStr})${titleStr}\n\n🔗 Powered by InstaGrab`;
}

/**
 * Build the "downloading" status message.
 */
export function buildDownloadingMessage(format: 'video' | 'audio'): string {
  const emoji = format === 'video' ? '📹' : '🎵';
  return `${emoji} Downloading your ${format}...\n\n⏳ Please wait, this may take a moment.`;
}
