import type { Metadata } from "next";
import { UnderDevelopment } from "@/components/UnderDevelopment";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Video Downloader — Save HD Videos Free | InstaGrab",
  description: "Download Instagram videos in full HD quality. Save feed videos, IGTV, and video posts directly to your device. Free, no login, no watermarks.",
  keywords: "instagram video downloader, download instagram video, save instagram video, instagram video saver, HD instagram video download, IGTV downloader",
};

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Instagram Video
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Downloader
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
            Quick save your favorite feed videos and IGTV in high quality — no app or login required.
          </p>
          <div className="w-full mt-2">
            <UnderDevelopment toolName="Video Downloader" />
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">The Best Instagram Video Downloader</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              InstaGrab lets you download any public Instagram feed video or IGTV in original HD quality.
              No apps to install, no account login needed — simply paste the video link and get the file.
            </p>
            <p>
              We pull files directly from Instagram&apos;s content delivery network, ensuring you receive the exact
              same resolution the creator originally posted. Whether it&apos;s a cooking tutorial, travel vlog,
              or a funny clip — save it forever in seconds.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
