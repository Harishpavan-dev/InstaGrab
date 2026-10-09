"use client";
import { DownloaderBase } from "./DownloaderBase";

export function ReelsDownloader() {
  return (
    <DownloaderBase
      config={{
        endpoint: "reels",
        placeholder: "Paste Instagram Reel link here...",
        buttonLabel: "Download",
        downloadLabel: "Download Reel 1080p",
        infoErrorMessage: "Failed to fetch reel info. Make sure this is a valid public Instagram Reel URL.",
        downloadErrorMessage: "Reel download failed. The reel may be private or removed by the creator.",
        processingText: "Processing reel...",
        badges: ["1080p Quality", "No Login", "Fast Download", "Audio Extract"],
        urlPatterns: ["instagram.com/reel/", "instagram.com/reels/"],
        showAudioExtract: true,
      }}
    />
  );
}
