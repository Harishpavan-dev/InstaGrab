import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "InstaGrab — Instagram Reels & Video Downloader",
  description: "Download Instagram reels, videos, stories, and photos in HD quality. Free, fast, no login required, and no watermarks.",
  keywords: "instagram reels downloader, instagram downloader, instagram video downloader, download instagram reels, save instagram video",
  verification: {
    google: "AU51raGO2nnNDGwu-stQRjjS38xCM6w-8lw1hTOkFDA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
