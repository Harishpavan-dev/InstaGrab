import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaGrab — Instagram Video & Reels Downloader",
  description: "Download Instagram reels, videos, stories, and photos in HD quality. Free, fast, no login required, and no watermarks.",
  keywords: "instagram downloader, instagram video downloader, instagram reels downloader, download instagram video, save instagram reels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
