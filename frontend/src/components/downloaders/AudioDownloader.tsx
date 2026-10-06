"use client";
import { DownloaderBase } from "./DownloaderBase";

export function AudioDownloader() {
  return (
    <DownloaderBase
      config={{
        endpoint: "audio",
        placeholder: "Paste Instagram video, reel, or specific audio/music link...",
        buttonLabel: "Extract",
        downloadLabel: "Extract MP3 Audio",
        infoErrorMessage: "Failed to fetch audio info. Make sure the link points to a public Instagram video, reel, or valid audio page.",
        downloadErrorMessage: "Audio extraction failed. Please ensure the link is a valid Instagram post or music link.",
        processingText: "Extracting audio...",
        badges: ["MP3 Format", "High Bitrate", "No Login", "100% Free"],
        urlPatterns: ["instagram.com/p/", "instagram.com/reel/", "instagram.com/tv/", "/audio/", "/reels/audio/"],
      }}
    />
  );
}
