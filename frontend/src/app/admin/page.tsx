"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Cpu,
  HardDrive,
  Activity,
  Users,
  Download,
  Search,
  RefreshCw,
  LogOut,
  Terminal,
  ExternalLink,
  CheckCircle,
  XCircle,
  Server,
  TrendingUp,
  Ban,
  Trash2,
  Cookie,
  ToggleLeft,
  ToggleRight,
  Globe,
  Upload,
  AlertTriangle,
  Bot,
  Send,
  Settings,
  RotateCcw,
  Video,
  Music,
  Check,
  Radio,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface MetricsData {
  cpu: { currentLoad: number; cores: number };
  memory: { totalMB: number; usedMB: number; freeMB: number; usagePercent: number };
  storage: { totalGB: number; usedGB: number; usagePercent: number };
  system: { uptimeSeconds: number; nodeVersion: string; platform: string; nodeMemoryMB: number; maintenanceMode: boolean };
}

interface LogEntry {
  id?: number;
  ip_address: string;
  country?: string;
  user_agent: string;
  tool_type: string;
  requested_url: string;
  status: "success" | "failed";
  error_message?: string;
  created_at: string;
}

interface BannedIp {
  id?: number;
  ip_address: string;
  reason?: string;
  created_at: string;
}

interface AnalyticsData {
  totalDownloads: number;
  totalUniqueUsers: number;
  todayDownloads: number;
  successRatePercent: number;
  topRequestedUrls: { url: string; count: number }[];
  toolBreakdown: Record<string, number>;
  countryBreakdown: { country: string; count: number }[];
}

interface CookieStatus {
  exists: boolean;
  filePath?: string;
  sizeBytes?: number;
  activeCookieLines?: number;
  lastModified?: string;
}

interface TelegramStatusData {
  running: boolean;
  uptime: number | null;
  botUsername: string | null;
  totalProcessed: number;
  startedAt: number | null;
  botEnabled: boolean;
  botTokenConfigured: boolean;
}

interface TelegramSettingsData {
  bot_enabled: boolean;
  bot_token?: string;
  welcome_message: string;
  max_daily_downloads_per_user: number;
  allowed_formats: string;
}

interface TelegramLogEntry {
  id?: number;
  telegram_user_id: number;
  telegram_username: string;
  first_name: string;
  requested_url: string;
  format: "video" | "audio";
  status: "success" | "failed";
  error_message?: string;
  file_size_bytes?: number;
  created_at: string;
}

interface TelegramAnalyticsData {
  totalRequests: number;
  todayRequests: number;
  uniqueUsers: number;
  videoDownloads: number;
  audioDownloads: number;
  successRate: number;
  topUsers: { username: string; count: number }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "banned" | "cookies" | "metrics" | "analytics" | "systemLogs" | "telegram">("logs");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [bannedIps, setBannedIps] = useState<BannedIp[]>([]);
  const [newBanIp, setNewBanIp] = useState("");
  const [banReason, setBanReason] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cookieStatus, setCookieStatus] = useState<CookieStatus | null>(null);
  const [cookieContentInput, setCookieContentInput] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [systemLogType, setSystemLogType] = useState<"combined" | "error">("combined");
  const [actionMessage, setActionMessage] = useState("");

  // Telegram States
  const [tgStatus, setTgStatus] = useState<TelegramStatusData | null>(null);
  const [tgSettings, setTgSettings] = useState<TelegramSettingsData | null>(null);
  const [tgLogs, setTgLogs] = useState<TelegramLogEntry[]>([]);
  const [tgLogTotal, setTgLogTotal] = useState(0);
  const [tgPage, setTgPage] = useState(1);
  const [tgSearch, setTgSearch] = useState("");
  const [tgAnalytics, setTgAnalytics] = useState<TelegramAnalyticsData | null>(null);
  const [tgTokenInput, setTgTokenInput] = useState("");
  const [tgWelcomeMsgInput, setTgWelcomeMsgInput] = useState("");
  const [tgMaxDailyInput, setTgMaxDailyInput] = useState<number>(20);
  const [tgVideoAllowed, setTgVideoAllowed] = useState(true);
  const [tgAudioAllowed, setTgAudioAllowed] = useState(true);
  const [savingTgSettings, setSavingTgSettings] = useState(false);
  const [tgActionLoading, setTgActionLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("instagrab_admin_token");
    if (!savedToken) {
      router.push("/admin/login");
    } else {
      setToken(savedToken);
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 10000);
      return () => clearInterval(interval);
    }
  }, [token, page, search, systemLogType, tgPage, tgSearch]);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  const fetchAllData = async () => {
    if (!token) return;
    setRefreshing(true);

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [
        metricsRes,
        logsRes,
        bannedRes,
        analyticsRes,
        cookiesRes,
        systemLogsRes,
        tgStatusRes,
        tgSettingsRes,
        tgLogsRes,
        tgAnalyticsRes,
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/admin/metrics`, { headers }),
        axios.get(`${API_URL}/admin/logs?page=${page}&limit=30&search=${encodeURIComponent(search)}`, { headers }),
        axios.get(`${API_URL}/admin/banned-ips`, { headers }),
        axios.get(`${API_URL}/admin/analytics`, { headers }),
        axios.get(`${API_URL}/admin/cookies`, { headers }),
        axios.get(`${API_URL}/admin/system-logs?type=${systemLogType}`, { headers }),
        axios.get(`${API_URL}/admin/telegram/status`, { headers }),
        axios.get(`${API_URL}/admin/telegram/settings`, { headers }),
        axios.get(`${API_URL}/admin/telegram/logs?page=${tgPage}&limit=30&search=${encodeURIComponent(tgSearch)}`, { headers }),
        axios.get(`${API_URL}/admin/telegram/analytics`, { headers }),
      ]);

      if (metricsRes.status === "fulfilled" && metricsRes.value.data?.success) {
        setMetrics(metricsRes.value.data.data);
      }
      if (logsRes.status === "fulfilled" && logsRes.value.data?.success) {
        setLogs(logsRes.value.data.data.logs || []);
        setLogTotal(logsRes.value.data.data.pagination?.total || 0);
      }
      if (bannedRes.status === "fulfilled" && bannedRes.value.data?.success) {
        setBannedIps(bannedRes.value.data.data.bannedIps || []);
      }
      if (analyticsRes.status === "fulfilled" && analyticsRes.value.data?.success) {
        setAnalytics(analyticsRes.value.data.data);
      }
      if (cookiesRes.status === "fulfilled" && cookiesRes.value.data?.success) {
        setCookieStatus(cookiesRes.value.data.data);
      }
      if (systemLogsRes.status === "fulfilled" && systemLogsRes.value.data?.success) {
        setSystemLogs(systemLogsRes.value.data.data.logs || []);
      }
      if (tgStatusRes.status === "fulfilled" && tgStatusRes.value.data?.success) {
        setTgStatus(tgStatusRes.value.data.data);
      }
      if (tgSettingsRes.status === "fulfilled" && tgSettingsRes.value.data?.success) {
        const s = tgSettingsRes.value.data.data?.settings;
        setTgSettings(s);
        if (!tgWelcomeMsgInput && s) {
          setTgWelcomeMsgInput(s.welcome_message || "");
          setTgMaxDailyInput(s.max_daily_downloads_per_user || 20);
          setTgVideoAllowed(s.allowed_formats?.includes("video") ?? true);
          setTgAudioAllowed(s.allowed_formats?.includes("audio") ?? true);
          if (s.bot_token) setTgTokenInput(s.bot_token);
        }
      }
      if (tgLogsRes.status === "fulfilled" && tgLogsRes.value.data?.success) {
        setTgLogs(tgLogsRes.value.data.data.logs || []);
        setTgLogTotal(tgLogsRes.value.data.data.pagination?.total || 0);
      }
      if (tgAnalyticsRes.status === "fulfilled" && tgAnalyticsRes.value.data?.success) {
        setTgAnalytics(tgAnalyticsRes.value.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("instagrab_admin_token");
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("instagrab_admin_token");
    localStorage.removeItem("instagrab_admin_user");
    router.push("/admin/login");
  };

  const handleToggleMaintenance = async () => {
    if (!token || !metrics) return;
    const nextState = !metrics.system.maintenanceMode;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/admin/maintenance`, { enabled: nextState }, { headers });
      if (res.data?.success) {
        showToast(res.data.message);
        fetchAllData();
      }
    } catch (err: any) {
      showToast("Failed to toggle maintenance mode.");
    }
  };

  const handleCleanTemp = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/admin/clean-temp`, {}, { headers });
      if (res.data?.success) {
        showToast(res.data.message);
        fetchAllData();
      }
    } catch (err) {
      showToast("Failed to clean temp directory.");
    }
  };

  const handleBanIp = async (ipToBan: string, reasonToBan?: string) => {
    if (!token || !ipToBan) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/admin/banned-ips`, { ip: ipToBan, reason: reasonToBan || "Banned by Admin" }, { headers });
      if (res.data?.success) {
        showToast(`IP ${ipToBan} has been banned.`);
        setNewBanIp("");
        setBanReason("");
        fetchAllData();
      }
    } catch (err) {
      showToast("Failed to ban IP.");
    }
  };

  const handleUnbanIp = async (ipToUnban: string) => {
    if (!token || !ipToUnban) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`${API_URL}/admin/banned-ips/${encodeURIComponent(ipToUnban)}`, { headers });
      if (res.data?.success) {
        showToast(`IP ${ipToUnban} unbanned.`);
        fetchAllData();
      }
    } catch (err) {
      showToast("Failed to unban IP.");
    }
  };

  const handleSaveCookies = async () => {
    if (!token || !cookieContentInput.trim()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/admin/cookies`, { cookiesContent: cookieContentInput }, { headers });
      if (res.data?.success) {
        showToast(res.data.message);
        setCookieContentInput("");
        fetchAllData();
      }
    } catch (err) {
      showToast("Failed to update cookies file.");
    }
  };

  const handleToggleTelegram = async () => {
    if (!token) return;
    setTgActionLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const nextState = !tgStatus?.running;
      const res = await axios.post(`${API_URL}/admin/telegram/toggle`, { enabled: nextState }, { headers });
      if (res.data?.success) {
        showToast(res.data.message || `Telegram bot ${nextState ? "started" : "stopped"}`);
        fetchAllData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || "Failed to toggle Telegram bot.");
    } finally {
      setTgActionLoading(false);
    }
  };

  const handleRestartTelegram = async () => {
    if (!token) return;
    setTgActionLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/admin/telegram/restart`, {}, { headers });
      if (res.data?.success) {
        showToast(res.data.message || "Telegram bot restarted successfully");
        fetchAllData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || "Failed to restart Telegram bot.");
    } finally {
      setTgActionLoading(false);
    }
  };

  const handleSaveTelegramSettings = async () => {
    if (!token) return;
    setSavingTgSettings(true);
    try {
      const formats: string[] = [];
      if (tgVideoAllowed) formats.push("video");
      if (tgAudioAllowed) formats.push("audio");

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_URL}/admin/telegram/settings`,
        {
          bot_token: tgTokenInput.trim() || undefined,
          welcome_message: tgWelcomeMsgInput,
          max_daily_downloads_per_user: Number(tgMaxDailyInput),
          allowed_formats: formats.join(","),
        },
        { headers }
      );
      if (res.data?.success) {
        showToast("Telegram bot settings updated successfully!");
        fetchAllData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || "Failed to save Telegram settings.");
    } finally {
      setSavingTgSettings(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading Admin Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Alert Banner */}
      {actionMessage && (
        <div className="fixed top-5 right-5 z-50 bg-purple-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">InstaGrab Admin Command Center</h1>
              {metrics?.system.maintenanceMode ? (
                <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Maintenance Active
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  Live Production
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">EC2 IP: 13.202.85.161 • Real-time Monitoring & Control</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Maintenance Switch */}
          <button
            onClick={handleToggleMaintenance}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              metrics?.system.maintenanceMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
            title="Toggle server maintenance mode"
          >
            {metrics?.system.maintenanceMode ? (
              <ToggleRight className="w-4 h-4 text-amber-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            Maintenance Mode
          </button>

          {/* Clean Temp Files */}
          <button
            onClick={handleCleanTemp}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Delete all temporary video files on server"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clean Temp
          </button>

          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* CPU Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CPU Load</span>
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{metrics?.cpu.currentLoad || 0}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics?.cpu.currentLoad || 0)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{metrics?.cpu.cores || 1} CPU Cores Active</p>
        </div>

        {/* RAM Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RAM Memory</span>
            <Activity className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{metrics?.memory.usagePercent || 0}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics?.memory.usagePercent || 0)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {metrics?.memory.usedMB || 0} MB / {metrics?.memory.totalMB || 0} MB
          </p>
        </div>

        {/* Storage Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disk Storage</span>
            <HardDrive className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{metrics?.storage.usagePercent || 0}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics?.storage.usagePercent || 0)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {metrics?.storage.usedGB || 0} GB / {metrics?.storage.totalGB || 0} GB Used
          </p>
        </div>

        {/* Downloads / Traffic Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Downloads</span>
            <Download className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{analytics?.totalDownloads || 0}</div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
            <span>Today: <strong className="text-emerald-400">{analytics?.todayDownloads || 0}</strong></span>
            <span>IPs: <strong className="text-purple-400">{analytics?.totalUniqueUsers || 0}</strong></span>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{analytics?.successRatePercent || 100}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics?.successRatePercent || 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Download Reliability Rate</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 mb-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "logs"
              ? "border-purple-500 text-purple-400 bg-purple-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          User Activity Logs ({logTotal})
        </button>

        <button
          onClick={() => setActiveTab("banned")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "banned"
              ? "border-purple-500 text-purple-400 bg-purple-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Ban className="w-4 h-4 text-rose-400" />
          IP Control ({bannedIps.length})
        </button>

        <button
          onClick={() => setActiveTab("cookies")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "cookies"
              ? "border-purple-500 text-purple-400 bg-purple-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cookie className="w-4 h-4 text-amber-400" />
          Instagram Cookies
        </button>

        <button
          onClick={() => setActiveTab("metrics")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "metrics"
              ? "border-purple-500 text-purple-400 bg-purple-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="w-4 h-4" />
          System Hardware
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-purple-500 text-purple-400 bg-purple-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          Top Links & Countries
        </button>

        <button
          onClick={() => setActiveTab("systemLogs")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "systemLogs"
              ? "border-purple-500 text-purple-400 bg-purple-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal className="w-4 h-4" />
          Server Logs Console
        </button>

        <button
          onClick={() => setActiveTab("telegram")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "telegram"
              ? "border-sky-500 text-sky-400 bg-sky-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bot className="w-4 h-4 text-sky-400" />
          <span>Telegram Bot</span>
          {tgStatus?.running ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Bot Online" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-600 ml-0.5" title="Bot Offline" />
          )}
        </button>
      </div>

      {/* TAB 1: User Activity Logs */}
      {activeTab === "logs" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold">User Activity & Download Logs</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search IP, Country, or Link..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User IP & Country</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Requested Instagram URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No activity logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={log.id || index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{log.ip_address}</span>
                          <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            {log.country || "XX"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-slate-300 text-[10px]">
                        <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                          {log.tool_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-md truncate text-slate-300">
                        <a
                          href={log.requested_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-purple-400 flex items-center gap-1.5 truncate"
                          title={log.requested_url}
                        >
                          <span className="truncate">{log.requested_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.status === "success" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" /> Success
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-red-500/20"
                            title={log.error_message}
                          >
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleBanIp(log.ip_address, "Suspicious activity from user log")}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Ban className="w-3 h-3" /> Ban IP
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800 text-xs">
            <span className="text-slate-500">Showing page {page} of {Math.ceil(logTotal / 30) || 1}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page * 30 >= logTotal}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IP Ban Control */}
      {activeTab === "banned" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
            <Ban className="w-5 h-5" /> IP Restriction & Ban Control
          </h2>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newBanIp}
              onChange={(e) => setNewBanIp(e.target.value)}
              placeholder="IP Address to ban (e.g. 192.168.1.1)"
              className="bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none flex-1"
            />
            <input
              type="text"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for banning (e.g. Bot traffic / Abuse)"
              className="bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none flex-1"
            />
            <button
              onClick={() => handleBanIp(newBanIp, banReason)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" /> Block IP
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Banned IP Address</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Banned On</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bannedIps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No IP addresses currently banned.
                    </td>
                  </tr>
                ) : (
                  bannedIps.map((b) => (
                    <tr key={b.ip_address} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono text-rose-300 font-bold">{b.ip_address}</td>
                      <td className="py-3.5 px-4 text-slate-300">{b.reason || "Banned by Admin"}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(b.created_at).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleUnbanIp(b.ip_address)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Unban IP
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Instagram Cookies Manager */}
      {activeTab === "cookies" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-amber-400">
            <Cookie className="w-5 h-5" /> Instagram Cookies Manager
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Upload or paste Netscape format `cookies.txt` content to allow fetching private or restricted Instagram posts without opening SSH.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Status</span>
              <span className={`font-bold text-sm ${cookieStatus?.exists ? "text-emerald-400" : "text-amber-400"}`}>
                {cookieStatus?.exists ? "Active Cookies File Loaded" : "No Cookies File Found"}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Active Cookie Entries</span>
              <span className="font-bold text-sm text-purple-300">{cookieStatus?.activeCookieLines || 0} lines</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Last Modified</span>
              <span className="font-bold text-xs text-slate-300">
                {cookieStatus?.lastModified ? new Date(cookieStatus.lastModified).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Paste New Netscape Cookies Content
            </label>
            <textarea
              rows={8}
              value={cookieContentInput}
              onChange={(e) => setCookieContentInput(e.target.value)}
              placeholder="# Netscape HTTP Cookie File&#10;.instagram.com TRUE / FALSE 1750000000 sessionid 12345..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-4 text-xs font-mono text-slate-200 outline-none"
            />

            <button
              onClick={handleSaveCookies}
              disabled={!cookieContentInput.trim()}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Save Cookies File
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Hardware & System Info */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              Node.js & OS Environment
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Server OS Platform</span>
                <span className="font-semibold text-slate-200">{metrics?.system.platform}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Node.js Runtime</span>
                <span className="font-semibold text-purple-400">{metrics?.system.nodeVersion}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">System Uptime</span>
                <span className="font-semibold text-emerald-400">
                  {formatUptime(metrics?.system.uptimeSeconds || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Node Process Memory (RSS)</span>
                <span className="font-semibold text-slate-200">{metrics?.system.nodeMemoryMB} MB</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              Download Tool Breakdown
            </h3>
            <div className="space-y-3 text-sm">
              {analytics?.toolBreakdown && Object.keys(analytics.toolBreakdown).length > 0 ? (
                Object.entries(analytics.toolBreakdown).map(([tool, count]) => (
                  <div key={tool} className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400 capitalize">{tool} Downloader</span>
                    <span className="font-semibold text-purple-300">{count} requests</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4">No download breakdown data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Top Links & Countries */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Top Requested Links
            </h2>
            <div className="space-y-3">
              {analytics?.topRequestedUrls && analytics.topRequestedUrls.length > 0 ? (
                analytics.topRequestedUrls.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-6 h-6 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        #{idx + 1}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-200 hover:text-purple-400 truncate flex items-center gap-1.5"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <span className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                      {item.count} downloads
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-8 text-center">No requested URLs logged yet.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" /> User Traffic by Country
            </h2>
            <div className="space-y-3">
              {analytics?.countryBreakdown && analytics.countryBreakdown.length > 0 ? (
                analytics.countryBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-800 text-[10px] text-slate-300 rounded flex items-center justify-center font-mono border border-slate-700">
                        {item.country}
                      </span>
                      Country Code: {item.country}
                    </span>
                    <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs px-3 py-1 rounded-full font-bold">
                      {item.count} requests
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-8 text-center">No country breakdown data available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: System Logs Console */}
      {activeTab === "systemLogs" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" /> Live Backend Server Logs
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSystemLogType("combined")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  systemLogType === "combined" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                Combined Logs
              </button>
              <button
                onClick={() => setSystemLogType("error")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  systemLogType === "error" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                Error Logs
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1">
            {systemLogs.length === 0 ? (
              <p className="text-slate-600">No system log lines to display.</p>
            ) : (
              systemLogs.map((line, i) => (
                <div key={i} className="py-0.5 border-b border-slate-900/50 hover:bg-slate-900/50 text-[11px] leading-relaxed">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: Telegram Bot Management */}
      {activeTab === "telegram" && (
        <div className="space-y-6">
          {/* Bot Status & Control Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold tracking-tight">Telegram Bot Controller</h2>
                    {tgStatus?.running ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online & Polling
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        Stopped
                      </span>
                    )}

                    {tgStatus?.botTokenConfigured ? (
                      <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        <Check className="w-3 h-3" /> Token Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        <AlertTriangle className="w-3 h-3" /> Token Not Set in .env
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                    {tgStatus?.botUsername ? (
                      <a
                        href={`https://t.me/${tgStatus.botUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                      >
                        @{tgStatus.botUsername}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>Username: Not Connected</span>
                    )}
                    <span>•</span>
                    <span>Uptime: {tgStatus?.uptime ? formatUptime(tgStatus.uptime) : "N/A"}</span>
                    <span>•</span>
                    <span>Max File Size: 50MB (Telegram Limit)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleTelegram}
                  disabled={tgActionLoading || !tgStatus?.botTokenConfigured}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    tgStatus?.running
                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-600/20"
                  } disabled:opacity-40`}
                >
                  {tgStatus?.running ? (
                    <>
                      <ToggleRight className="w-4 h-4" /> Stop Bot
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" /> Start Bot
                    </>
                  )}
                </button>

                <button
                  onClick={handleRestartTelegram}
                  disabled={tgActionLoading || !tgStatus?.running}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  title="Restart Bot Polling"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${tgActionLoading ? "animate-spin" : ""}`} />
                  Restart
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bot Downloads</span>
                <Send className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-slate-100">{tgAnalytics?.totalRequests || 0}</div>
              <p className="text-[11px] text-slate-500 mt-2">
                Processed via Telegram
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Traffic</span>
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-indigo-400">{tgAnalytics?.todayRequests || 0}</div>
              <p className="text-[11px] text-slate-500 mt-2">
                {tgAnalytics?.uniqueUsers || 0} unique users total
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">{tgAnalytics?.successRate || 100}%</div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tgAnalytics?.successRate || 100}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format Distribution</span>
                <Video className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Video className="w-3.5 h-3.5 text-purple-400" /> Video: <strong className="text-purple-300 font-bold">{tgAnalytics?.videoDownloads || 0}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Music className="w-3.5 h-3.5 text-amber-400" /> Audio: <strong className="text-amber-300 font-bold">{tgAnalytics?.audioDownloads || 0}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">Breakdown by requested format</p>
            </div>
          </div>

          {/* Settings & Leaderboard Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Form (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" /> Bot Behavior & Limits Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telegram Bot API Token
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Enter the token provided by @BotFather. You can also configure this in your .env file as `TELEGRAM_BOT_TOKEN`.
                  </p>
                  <input
                    type="password"
                    value={tgTokenInput}
                    onChange={(e) => setTgTokenInput(e.target.value)}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxyz..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Welcome Message (`/start`)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Message shown to users when they start the bot. Use `&#123;&#123;name&#125;&#125;` to dynamically insert user's first name. Supports Markdown.
                  </p>
                  <textarea
                    rows={4}
                    value={tgWelcomeMsgInput}
                    onChange={(e) => setTgWelcomeMsgInput(e.target.value)}
                    placeholder="👋 Hey {{name}}! Welcome to InstaGrab Bot..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Daily Download Limit Per User
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={tgMaxDailyInput}
                      onChange={(e) => setTgMaxDailyInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Set 0 for unlimited daily downloads.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Allowed Formats
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tgVideoAllowed}
                          onChange={(e) => setTgVideoAllowed(e.target.checked)}
                          className="rounded border-slate-700 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        Video Download
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tgAudioAllowed}
                          onChange={(e) => setTgAudioAllowed(e.target.checked)}
                          className="rounded border-slate-700 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <Music className="w-3.5 h-3.5 text-amber-400" />
                        Audio Download
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveTelegramSettings}
                    disabled={savingTgSettings}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-sky-600/20"
                  >
                    <Check className="w-4 h-4" />
                    {savingTgSettings ? "Saving Settings..." : "Save Bot Settings"}
                  </button>
                </div>
              </div>
            </div>

            {/* Top Users Leaderboard (1 col) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Top Bot Users
              </h3>

              <div className="space-y-2.5">
                {tgAnalytics?.topUsers && tgAnalytics.topUsers.length > 0 ? (
                  tgAnalytics.topUsers.map((user, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-xs text-slate-200 font-medium truncate max-w-[140px]">
                          {user.username ? `@${user.username}` : `User ${idx + 1}`}
                        </span>
                      </div>
                      <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        {user.count} dl
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No user activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Telegram Activity Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold">Telegram Download Logs</h3>
                <p className="text-xs text-slate-400">Real-time log of every interaction with your Telegram bot</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={tgSearch}
                  onChange={(e) => setTgSearch(e.target.value)}
                  placeholder="Search username, link, or ID..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Telegram User</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Requested URL</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tgLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No Telegram activity logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    tgLogs.map((log, index) => (
                      <tr key={log.id || index} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">
                            {log.first_name || "User"}
                          </div>
                          <div className="text-[10px] text-sky-400 font-mono">
                            {log.telegram_username ? `@${log.telegram_username}` : `ID: ${log.telegram_user_id}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.format === "video" ? (
                            <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                              <Music className="w-3 h-3" /> Audio
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                          <a
                            href={log.requested_url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-sky-400 flex items-center gap-1.5 truncate"
                            title={log.requested_url}
                          >
                            <span className="truncate">{log.requested_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {formatBytes(log.file_size_bytes)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> Sent
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-rose-500/20"
                              title={log.error_message}
                            >
                              <XCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-500">
                Showing page {tgPage} of {Math.ceil(tgLogTotal / 30) || 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={tgPage <= 1}
                  onClick={() => setTgPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={tgPage * 30 >= tgLogTotal}
                  onClick={() => setTgPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

