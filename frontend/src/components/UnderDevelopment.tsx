"use client";

import Link from "next/link";

interface UnderDevelopmentProps {
  toolName: string;
}

export function UnderDevelopment({ toolName }: UnderDevelopmentProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-2xl p-8 md:p-10 text-center shadow-sm">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.024 1.194-.14 1.743" />
          </svg>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Under Development
        </div>

        {/* Text */}
        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">
          {toolName} — Coming Soon!
        </h3>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-6">
          We&apos;re actively building the <strong>{toolName}</strong>. It will be available shortly. In the meantime, try our fully functional Reels Downloader!
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Go to Reels Downloader
        </Link>
      </div>
    </div>
  );
}
