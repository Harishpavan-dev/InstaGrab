import type { Metadata } from "next";
import { UnderDevelopment } from "@/components/UnderDevelopment";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Photo Downloader — Download Full Resolution Pictures",
  description: "Save Instagram photos and carousel images in original high resolution. Free image downloader for Insta.",
  keywords: "instagram photo downloader, download instagram picture, save instagram image, HD insta photo save",
};

export default function PhotoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Instagram Photo
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Downloader
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
            Download single pictures or multi-photo carousel posts in full, original resolution.
          </p>
          <div className="w-full mt-2">
            <UnderDevelopment toolName="Photo Downloader" />
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">Save High Quality Photos from Instagram</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Don&apos;t settle for blurry screenshots. Our Instagram Photo Downloader retrieves the highest-resolution version of any public photo directly from Instagram&apos;s servers.
            </p>
            <p>
              Whether it&apos;s beautiful photography, inspiring quotes, or a friend&apos;s travel album — save it locally to view offline. We also support standard carousel posts so you can download all the images in a single post effortlessly.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
