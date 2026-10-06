import type { Metadata } from "next";
import { UnderDevelopment } from "@/components/UnderDevelopment";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Profile Picture Downloader — View HD Avatars",
  description: "Download full-size, HD Instagram profile pictures from any public account. Uncrop avatars with our free profile picture viewer.",
  keywords: "instagram profile picture downloader, download IG avatar, save instagram profile picture, view full size insta DP",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Instagram Profile
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Picture Viewer
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
            Download full-size, HD Instagram profile pictures. Uncrop and see avatars clearly.
          </p>
          <div className="w-full mt-2">
            <UnderDevelopment toolName="Profile Picture Downloader" />
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">View Full-Size Profile Pictures (DP)</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              By default, Instagram compresses and crops profile pictures into small circles, making it difficult to recognize someone or see the details in their display picture (DP).
            </p>
            <p>
              InstaGrab Profile Picture Downloader extracts the uncompressed, original HD photo that the user originally uploaded. Just enter their profile URL, and we&apos;ll instantly generate a download link for the full-resolution square avatar.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
