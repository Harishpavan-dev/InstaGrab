"use client";
import { DownloaderBase } from "./DownloaderBase";

export function VideoDownloader() {
  return (
    <DownloaderBase
      config={{
        endpoint: "video",
        placeholder: "Paste Instagram video link here...",
        buttonLabel: "Download",
        downloadLabel: "Download Video HD",
        infoErrorMessage: "Failed to fetch video information. Make sure this is a public Instagram video post.",
        downloadErrorMessage: "Video download failed. The post may be private or the link is invalid.",
        processingText: "Processing video...",
        badges: ["100% Free", "No Login Required", "HD Quality", "No Watermarks"],
        urlPatterns: ["instagram.com/p/", "instagram.com/tv/"],
      }}
    />
  );
}
