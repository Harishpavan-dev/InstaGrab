"use client";
import { DownloaderBase } from "./DownloaderBase";

export function PhotoDownloader() {
  return (
    <DownloaderBase
      config={{
        endpoint: "photo",
        placeholder: "Paste Instagram photo or carousel post link...",
        buttonLabel: "Download",
        downloadLabel: "Download Full-Res Photo",
        infoErrorMessage: "Failed to fetch photo info. Ensure this is a public Instagram photo post link.",
        downloadErrorMessage: "Photo download failed. The post may be private or the link is incorrect.",
        processingText: "Downloading photo...",
        badges: ["Full Resolution", "No Compression", "No Login", "100% Free"],
        urlPatterns: ["instagram.com/p/"],
      }}
    />
  );
}
