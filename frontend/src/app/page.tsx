import type { Metadata } from "next";
import { ReelsDownloader } from "@/components/downloaders";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Reels Downloader — Save HD Reels Without Watermark",
  description: "Save Instagram Reels in high quality instantly — Fast, free, and no watermarks. The ultimate tool for 1080p Full HD vertical video downloads.",
  keywords: "instagram reels downloader, download instagram reels, save instagram reels, HD reels no watermark, fast IG video download",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-purple-50/80 dark:from-purple-900/20 via-white dark:via-gray-950 to-white dark:to-gray-950 -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Instagram Reels
            <br />
            <span className="bg-linear-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Downloader
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
            Save Instagram Reels in high quality instantly — Fast, free, and no watermarks.
          </p>
          <div className="w-full mt-2">
            <ReelsDownloader />
          </div>
          <p className="text-xs text-gray-400 mt-2">Note: Only publicly accessible Instagram Reels are supported.</p>
        </div>
      </section>

      {/* Reels Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-3">Reels Features</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Why Download Reels with InstaGrab?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Save your favorite short vertical videos in pristine quality without compression or intrusive stamps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: "✨", title: "Zero Watermarks", desc: "Get clean, watermark-free MP4 reels directly from the source server." },
              { icon: "🎞️", title: "1080p Full HD", desc: "Download in the highest vertical resolution uploaded by the creator." },
              { icon: "🔊", title: "Synced Original Audio", desc: "Crystal clear audio track preserved with full multi-channel sound." },
              { icon: "⚡", title: "Instant Link Fetching", desc: "No queue times or slow conversions — download in under 3 seconds." },
              { icon: "📱", title: "Universal Compatibility", desc: "Plays smoothly on iOS Files, Android Gallery, Windows, and Mac." },
              { icon: "🔒", title: "100% Private & Safe", desc: "No account required, no login credentials, and no user activity tracking." },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Process */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Download Reels in 3 Easy Steps</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Follow these quick steps to save any Instagram Reel to your camera roll.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Copy the Reel Link", desc: "Open Instagram, tap the Share icon on the Reel, and tap \"Copy link\".", gradient: "from-purple-500 to-purple-700" },
              { step: "2", title: "Paste into InstaGrab", desc: "Return here, paste the copied link into the input bar above, and click Download.", gradient: "from-pink-500 to-rose-600" },
              { step: "3", title: "Save MP4 Video", desc: "Your high-definition, watermark-free Reel is ready — save directly to your gallery.", gradient: "from-orange-400 to-amber-500" },
            ].map((item) => (
              <div key={item.step} className="text-center flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${item.gradient} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Block */}
      <section className="py-12 bg-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🎬", title: "1080p Full HD", desc: "Direct MP4 source quality" },
            { icon: "🚫", title: "Zero Watermarks", desc: "Clean video without overlays" },
            { icon: "🎵", title: "Audio Synced", desc: "Original bitrate sound" },
            { icon: "⚡", title: "Under 3 Seconds", desc: "Fastest cloud processing" },
          ].map((stat) => (
            <div key={stat.title} className="flex flex-col items-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <h4 className="font-bold text-lg">{stat.title}</h4>
              <p className="text-purple-200 text-sm">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why InstaGrab & Deep Dive */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 space-y-16">
          
          <div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-2">Why InstaGrab</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-5 text-gray-900 dark:text-white">The Ultimate Instagram Reels Downloader</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              <p>Instagram Reels have become the epicenter of creative storytelling, comedy, recipes, and tutorials. However, saving Reels directly to your camera roll without third-party watermarks or compression has always been a challenge.</p>
              <p>InstaGrab connects directly to Instagram&apos;s content delivery networks, allowing you to fetch the original, uncompressed vertical MP4 file. You get pristine frame rates (up to 60fps) and clear audio synchronization.</p>
              <p>Whether you&apos;re an editor collecting B-roll footage, an archivist saving important memories, or simply curating an offline reel collection, our online downloader gives you rapid, login-free access on all devices.</p>
            </div>
          </div>

          <div>
             <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-2">Deep Dive</p>
             <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8 text-gray-900 dark:text-white">Why Download Instagram Reels Offline?</h2>
             
             <div className="space-y-8">
               <div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Permanent Offline Library</h3>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed">In-app saving is temporary — creators can delete their posts, turn accounts private, or have their profiles suspended at any moment. By downloading Reels to your local storage, you guarantee permanent access to your favorite fitness routines, cooking recipes, and entertainment clips.</p>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Clean Videos for Content Creation</h3>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Screen recordings capture messy UI elements, profile overlays, and compression artifacts. InstaGrab delivers clean, watermark-free MP4 files identical to the creator&apos;s upload, making it the perfect tool for video editors and social media managers.</p>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Perfect Audio Synchronization</h3>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Trending music and voiceovers are essential to the Reel experience. Our downloader extracts the audio track at its original bitrate, ensuring seamless lip-syncing and crystal-clear stereo audio on every playback.</p>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Zero Registration & Maximum Privacy</h3>
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Your browsing and downloading habits are your business. We never request passwords, install background tracking cookies, or log your download history. Experience total peace of mind every time you save a Reel.</p>
               </div>
             </div>
          </div>

        </div>
      </section>

      {/* Device Guides */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-3">Device Guides</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">How to Download Reels on Any Device</h2>
          </div>
          <div className="space-y-6">
            {[
              { icon: "🍎", title: "iPhone (iOS)", desc: "Open the Reel on Instagram, tap 'Share' (paper plane icon), and 'Copy Link'. Open Safari, go to InstaGrab, paste the link, and tap Download. Save the MP4 directly to your Files or Photos app." },
              { icon: "🤖", title: "Android", desc: "Find the Reel on Instagram, tap the three dots or Share icon, and select 'Copy Link'. Open Chrome, visit InstaGrab, paste the link, and save the video directly to your Gallery." },
              { icon: "💻", title: "PC / Mac", desc: "Copy the URL from your address bar while watching the Reel on your desktop browser. Visit InstaGrab, paste the link, and download the full-resolution MP4 directly to your Downloads folder." },
            ].map((guide) => (
              <div key={guide.title} className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-3xl shrink-0">{guide.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{guide.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{guide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Everything you need to know about downloading Instagram Reels.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "Can I download Reels without watermarks?", a: "Yes! InstaGrab fetches the original video file directly from the source, so you get the Reel exactly as it was uploaded, with zero added watermarks or app logos." },
              { q: "Is there a limit on how many Reels I can save?", a: "No, there are absolutely no limits. You can download as many Reels as you want, 100% free of charge and with no throttling." },
              { q: "Does it work for private Reels?", a: "To protect user privacy and respect platform security, our downloader only supports content from public Instagram accounts." },
              { q: "Can I download just the audio from a Reel?", a: "Yes! When you paste a Reel link, InstaGrab gives you the option to download the full HD video or extract the audio track as an MP3 file." },
              { q: "Is my account safe when using this tool?", a: "Completely. We never ask for your Instagram credentials, passwords, or personal info. You don't even need an Instagram account to use InstaGrab." },
              { q: "Where are Reels saved on my mobile device?", a: "On iPhone, the video is saved to your 'Downloads' folder in the Files app (which you can save to Photos). On Android, it downloads straight to your Gallery / Downloads folder." },
            ].map((faq) => (
              <div key={faq.q} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
