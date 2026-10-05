"use client";

import { useState, FormEvent } from "react";
import { Download, Loader2, AlertCircle, CheckCircle2, Clipboard, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type JobStatus = "pending" | "downloading" | "completed" | "failed";

interface VideoInfo {
  platform: "instagram";
  title: string;
  thumbnail?: string;
  duration?: number;
  author?: string;
}

interface JobData {
  id: string;
  status: JobStatus;
  progress: number;
  fileName?: string;
  error?: string;
  fileSize?: number;
}

export function MainDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [lastFetchedUrl, setLastFetchedUrl] = useState("");

  const pollStatus = async (jobId: string) => {
    try {
      const res = await axios.get(`${API_URL}/download/status/${jobId}`);
      if (res.data?.success) {
        setJob(res.data.data);
        if (res.data.data.status === "downloading" || res.data.data.status === "pending" || res.data.data.status === "processing" || res.data.data.status === "queued") {
          setTimeout(() => pollStatus(jobId), 1500);
        } else if (res.data.data.status === "completed") {
          window.location.href = `${API_URL}/download/file/${jobId}`;
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch download status.");
    }
  };

  const fetchInfo = async (fetchUrl: string) => {
    if (!fetchUrl) return;
    
    setLastFetchedUrl(fetchUrl);
    setLoading(true);
    setError("");
    setVideoInfo(null);
    setJob(null);

    try {
      const res = await axios.post(`${API_URL}/download/info`, { url: fetchUrl });
      if (res.data?.success) {
        setVideoInfo(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to fetch video information. Make sure the post is public.");
      setLastFetchedUrl(""); // Reset so they can try again
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        if (text.includes("instagram.com")) {
          fetchInfo(text);
        }
      }
    } catch {
      // Clipboard API not available
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (url && url !== lastFetchedUrl) {
      fetchInfo(url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Auto analyze if it looks like a valid link
    if (newUrl.includes("instagram.com/p/") || newUrl.includes("instagram.com/reel/") || newUrl.includes("instagram.com/tv/") || newUrl.includes("instagram.com/stories/")) {
       if (newUrl !== lastFetchedUrl && !loading) {
         fetchInfo(newUrl);
       }
    } else {
       // Clear output if user types something invalid after a fetch
       if (videoInfo || job || error) {
         setVideoInfo(null);
         setJob(null);
         setError("");
         setLastFetchedUrl("");
       }
    }
  };

  const handleStartDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = { url, quality: "highest" };
      const res = await axios.post(`${API_URL}/download`, payload);
      if (res.data?.success) {
        setJob({ id: res.data.data.id, status: res.data.data.status, progress: 0 });
        pollStatus(res.data.data.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to start download.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFile = () => {
    if (job?.id && job.status === "completed") {
      window.location.href = `${API_URL}/download/file/${job.id}`;
    }
  };

  const handleReset = () => {
    setUrl("");
    setVideoInfo(null);
    setJob(null);
    setError("");
    setLoading(false);
    setLastFetchedUrl("");
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
        <div className="flex items-center w-full bg-white rounded-full border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-purple-300 focus-within:border-purple-500 focus-within:shadow-xl transition-all duration-300 pl-5 pr-2 py-1.5 gap-2">
          <Link2 className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="url"
            id="instagram-url-input"
            value={url}
            onChange={handleInputChange}
            placeholder="Paste Instagram link here..."
            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 py-3 text-base"
            required
            disabled={loading}
          />

          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="text-gray-600 hover:text-purple-700 bg-gray-100 hover:bg-purple-100 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Paste
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !url}
            id="fetch-download-button"
            className="bg-purple-600 hover:bg-purple-700 text-white px-7 py-2.5 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer active:scale-95 min-w-[120px]"
          >
            {loading && !job && !videoInfo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Download"
            )}
          </button>
        </div>
      </form>

      {/* Feature Badges */}
      {!videoInfo && !job && !error && (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-1">
          {[
            { label: "100% Free", color: "text-emerald-600" },
            { label: "No Login Required", color: "text-emerald-600" },
            { label: "HD Quality", color: "text-emerald-600" },
            { label: "No Watermarks", color: "text-emerald-600" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-1.5 text-sm text-gray-600">
              <CheckCircle2 className={`w-4 h-4 ${badge.color}`} />
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 px-6 py-4 rounded-xl max-w-2xl w-full"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Video Info Card */}
        {videoInfo && !job && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-5 shadow-lg overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-5">
              {videoInfo.thumbnail ? (
                <div className="relative w-full md:w-44 aspect-video md:aspect-square rounded-xl overflow-hidden shrink-0">
                  <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-pink-500 px-2.5 py-1 rounded-md text-xs font-bold text-white">
                    Instagram
                  </div>
                </div>
              ) : (
                <div className="w-full md:w-44 aspect-square rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{videoInfo.title}</h3>
                  {videoInfo.author && (
                    <p className="text-gray-500 text-sm">@{videoInfo.author}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleStartDownload}
                    disabled={loading}
                    id="download-button"
                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer active:scale-95"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    Download HD
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-sm font-medium cursor-pointer"
                  >
                    New Link
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Download Progress / Status */}
        {job && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center shadow-lg"
          >
            {job.status === "failed" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download Failed</h3>
                <p className="text-gray-500 text-sm mb-6">{job.error || "Something went wrong."}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </>
            ) : job.status === "completed" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download Started!</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Your file is downloading automatically.
                  <br/>
                  <span className="text-xs text-gray-400">
                    {job.fileName && job.fileSize ? `${job.fileName} (${(job.fileSize / 1024 / 1024).toFixed(2)} MB)` : ""}
                  </span>
                </p>
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  Download Another Link
                </button>
              </>
            ) : (
              <>
                <div className="relative w-20 h-20 mb-5">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" className="fill-none stroke-gray-200" strokeWidth="4" />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      className="fill-none stroke-purple-500 transition-all duration-500"
                      strokeWidth="4"
                      strokeDasharray="226"
                      strokeDashoffset={226 - (226 * (job.progress || 5)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-bold text-sm">
                    {job.progress > 0 ? `${Math.round(job.progress)}%` : <Loader2 className="w-5 h-5 animate-spin text-purple-500" />}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {job.status === "pending" || job.status === "downloading" ? "Processing..." : "Downloading..."}
                </h3>
                <p className="text-gray-400 text-sm">Please wait while we fetch your content.</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
