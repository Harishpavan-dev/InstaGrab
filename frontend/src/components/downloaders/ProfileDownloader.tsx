"use client";
import { DownloaderBase } from "./DownloaderBase";

export function ProfileDownloader() {
  return (
    <DownloaderBase
      config={{
        endpoint: "profile",
        placeholder: "Paste Instagram profile link (e.g. instagram.com/username)...",
        buttonLabel: "Download",
        downloadLabel: "Download HD Avatar",
        infoErrorMessage: "Failed to fetch profile info. Enter a valid public Instagram profile URL like instagram.com/username.",
        downloadErrorMessage: "Profile picture download failed. The account may not exist or is private.",
        processingText: "Fetching profile picture...",
        badges: ["Full-Size Avatar", "Uncropped", "No Login", "100% Free"],
        urlPatterns: ["instagram.com/"],
        formatUrlForApi: (input: string) => {
          let str = input.trim();
          if (!str.includes("instagram.com")) {
            str = str.replace(/^@/, '');
            return `https://www.instagram.com/${str}/`;
          }
          // Make sure it has https
          if (!str.startsWith("http")) return `https://${str}`;
          return str;
        }
      }}
    />
  );
}
