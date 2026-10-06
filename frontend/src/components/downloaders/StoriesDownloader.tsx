"use client";
import { DownloaderBase } from "./DownloaderBase";

export function StoriesDownloader() {
  return (
    <DownloaderBase
      config={{
        endpoint: "stories",
        placeholder: "Paste Instagram story link here...",
        buttonLabel: "Download",
        downloadLabel: "Save Story",
        infoErrorMessage: "Failed to fetch story info. Stories must be from a public account and still active (within 24 hours).",
        downloadErrorMessage: "Story download failed. The story may have expired or the account is private.",
        processingText: "Saving story...",
        badges: ["Before It Expires", "HD Quality", "No Login", "100% Free"],
        urlPatterns: ["instagram.com/stories/", "instagram.com/"],
        formatUrlForApi: (input: string) => {
          let str = input.trim();
          if (!str.includes("instagram.com")) {
            str = str.replace(/^@/, ''); // remove starting @ ifexists
            return `https://www.instagram.com/stories/${str}/`;
          }
          if (str.includes("instagram.com") && !str.includes("/stories/")) {
             const parts = str.split('instagram.com/');
             if (parts[1]) {
                const username = parts[1].split('/')[0];
                return `https://www.instagram.com/stories/${username}/`;
             }
          }
          return str;
        }
      }}
    />
  );
}
