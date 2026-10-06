import type { Metadata } from "next";
import { UnderDevelopment } from "@/components/UnderDevelopment";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Audio Downloader — Extract MP3 from Reels & Videos",
  description: "Download original background music and audio tracks from Instagram Reels and videos as MP3 files. Fast, high-quality audio extraction.",
  keywords: "instagram audio downloader, download instagram audio, extract instagram mp3, reels audio saver",
};

export default function AudioPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Instagram Audio
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Extractor
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
            Extract high-quality MP3 audio from any trending Instagram reel or video instantly.
          </p>
          <div className="w-full mt-2">
            <UnderDevelopment toolName="Audio Extractor" />
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">Convert Instagram Videos to MP3</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Often find yourself obsessed with a trending song, a podcast excerpt, or a funny soundbite on an Instagram Reel? InstaGrab&apos;s Audio Extractor allows you to separate the audio track from the video and save it as a high-bitrate MP3 file.
            </p>
            <p>
              It&apos;s perfect for creators who want to reuse trending audio, students saving educational lectures, or just building your offline music library with unique covers found only on Instagram.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
