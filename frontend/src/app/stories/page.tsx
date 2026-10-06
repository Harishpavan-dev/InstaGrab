import type { Metadata } from "next";
import { UnderDevelopment } from "@/components/UnderDevelopment";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Story Downloader — Save IG Stories Fast & Anonymously",
  description: "Download 24-hour ephemeral Instagram stories securely. Save photo and video stories in HD quality without notifying the creator.",
  keywords: "instagram story downloader, save ig stories, download insta story, anonymous story viewer",
};

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Instagram Story
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Downloader
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
            Save ephemeral stories in HD quality before they vanish after 24 hours.
          </p>
          <div className="w-full mt-2">
            <UnderDevelopment toolName="Story Downloader" />
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">Download Fleeting Stories Before They Expire</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Instagram Stories exist for only 24 hours. If there&apos;s an announcement, a special memory, or a beautiful shot you want to keep, our Story Downloader lets you securely save it in standard MP4/JPG formats.
            </p>
            <p>
              You don&apos;t need to log in to our platform, meaning your story views stay completely private. Save whatever you want anonymously without leaving your footprint in their &apos;viewers&apos; list.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
