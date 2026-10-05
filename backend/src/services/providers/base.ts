import { VideoInfo, VideoFormat } from '../../types';

export interface DownloadProvider {
  getInfo(url: string): Promise<VideoInfo>;
  download(url: string, outputPath: string, quality: string, format: string): Promise<string>;
}
