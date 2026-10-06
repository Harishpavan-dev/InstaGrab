"use client";

import { MainDownloader } from "./MainDownloader";
import { Footer } from "./Footer";

interface ToolPageLayoutProps {
  title: string;
  highlightText: string;
  subtitle: string;
  /** The type hint passed into the downloader for future backend differentiation */
  toolType: "video" | "reels" | "audio" | "photo" | "stories" | "profile";
}

const seoBlocks: Record<string, { heading: string; paragraphs: string[] }> = {
  video: {
    heading: "The Best Instagram Video Downloader",
    paragraphs: [
      "InstaGrab lets you download any public Instagram feed video or IGTV in original HD quality. No app, no login — just paste the link and save.",
      "We pull files directly from Instagram's servers, ensuring you get the same resolution the creator originally posted. Works on any device, any browser.",
    ],
  },
  reels: {
    heading: "Save Instagram Reels in 1080p",
    paragraphs: [
      "Capture your favorite Instagram Reels in full 1080p resolution. Short vertical videos saved to your device in seconds.",
      "Perfect for saving trending music clips, dance choreography, or comedy reels with zero watermarks.",
    ],
  },
  audio: {
    heading: "Extract Audio from Instagram Videos",
    paragraphs: [
      "Convert any Instagram video or reel into a high-quality MP3 audio file. Perfect for saving music, podcasts, or audio snippets.",
      "Simply paste the Instagram link and we'll extract the audio track in the highest available bitrate.",
    ],
  },
  photo: {
    heading: "Download Instagram Photos in Full Resolution",
    paragraphs: [
      "Save single images or entire carousel posts from Instagram in their original full-resolution quality.",
      "No compression, no cropping — get the exact image the creator uploaded, perfect for inspiration boards and archives.",
    ],
  },
  stories: {
    heading: "Save Instagram Stories Before They Disappear",
    paragraphs: [
      "Instagram Stories vanish after 24 hours. InstaGrab lets you capture them in full quality before they're gone forever.",
      "Save video stories and photo stories from any public account. Perfect for archiving content you don't want to lose.",
    ],
  },
  profile: {
    heading: "Download Instagram Profile Pictures in HD",
    paragraphs: [
      "View and save full-size, uncropped Instagram profile pictures. Instagram normally shows tiny circular avatars — we give you the original HD version.",
      "Enter the profile URL and instantly get the high-resolution avatar image ready to download.",
    ],
  },
};

export function ToolPageLayout({ title, highlightText, subtitle, toolType }: ToolPageLayoutProps) {
  const seo = seoBlocks[toolType];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            {title}
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              {highlightText}
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">{subtitle}</p>

          <div className="w-full mt-2">
            <MainDownloader toolType={toolType} />
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      {seo && (
        <section className="py-14 bg-gray-50 border-y border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-center">{seo.heading}</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-center">
              {seo.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Supported Media Types */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-purple-600 tracking-widest uppercase mb-3">Supported Media Types</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">What Can You Download?</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              InstaGrab handles the full range of public Instagram content in original quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 5.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                  </svg>
                ),
                title: "Reels",
                desc: "Short vertical videos from your feed or explore page — saved in up to 1080p.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                ),
                title: "Feed Videos",
                desc: "Regular video posts from any public profile in their original resolution.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                ),
                title: "Photos",
                desc: "Single images or multi-slide carousel posts, full resolution JPG.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                  </svg>
                ),
                title: "Audio / MP3",
                desc: "Extract high-quality MP3 audio from any Instagram video or reel.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
                title: "Stories",
                desc: "Capture ephemeral 24-hour stories from any public account.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
                title: "Profile Pictures",
                desc: "View and save full-size, uncropped avatars from public accounts.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-purple-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-purple-600 tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Download in 3 Easy Steps</h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base">Get your favorite content saved to your device in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Copy the Link",
                desc: 'Open Instagram, find the video or reel, tap Share and select "Copy Link".',
                gradient: "from-purple-500 to-purple-700",
              },
              {
                step: "2",
                title: "Paste the URL",
                desc: "Return to InstaGrab and paste the copied link into the input field.",
                gradient: "from-pink-500 to-rose-600",
              },
              {
                step: "3",
                title: "Download & Save",
                desc: "Click Download and save the original-quality media directly to your device.",
                gradient: "from-orange-400 to-amber-500",
              },
            ].map((item) => (
              <div key={item.step} className="text-center flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
