"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Download, FileText, Film, Music, Image as ImageIcon, 
  Loader2, AlertCircle, HardDrive, Zap, Copy, Check 
} from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://dl.ybxanime.com";

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type?: string;
  downloadPath?: string;
  downloadUrl?: string;
  token?: string;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileIcon(name: string) {
  const n = name.toLowerCase();
  if (/\.(mp4|mkv|webm|avi|mov|flv)$/i.test(n)) return <Film className="w-8 h-8 text-violet-400" />;
  if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(n)) return <Music className="w-8 h-8 text-emerald-400" />;
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(n)) return <ImageIcon className="w-8 h-8 text-pink-400" />;
  return <FileText className="w-8 h-8 text-cyan-400" />;
}

function getFileColor(name: string) {
  const n = name.toLowerCase();
  if (/\.(mp4|mkv|webm|avi|mov|flv)$/i.test(n)) return { border: "border-violet-500/30", glow: "shadow-violet-500/20", btn: "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500", ring: "ring-violet-500/40" };
  if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(n)) return { border: "border-emerald-500/30", glow: "shadow-emerald-500/20", btn: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500", ring: "ring-emerald-500/40" };
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(n)) return { border: "border-pink-500/30", glow: "shadow-pink-500/20", btn: "from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500", ring: "ring-pink-500/40" };
  if (/\.(zip|rar|7z|tar|gz)$/i.test(n)) return { border: "border-amber-500/30", glow: "shadow-amber-500/20", btn: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500", ring: "ring-amber-500/40" };
  return { border: "border-cyan-500/30", glow: "shadow-cyan-500/20", btn: "from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500", ring: "ring-cyan-500/40" };
}

function getFileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "FILE" : "FILE";
}

function DownloadContent() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("path") || searchParams.get("id") || searchParams.get("token") || searchParams.get("file_id");
  
  const [file, setFile] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fileId) {
      setError("No file ID or path provided.");
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    async function loadData() {
      let fetchedData: any = null;

      const endpoints = [
        `/api/getToken/${fileId}`,
        `${BACKEND_URL}/api/getToken/${fileId}`,
      ];

      const fetchEndpoint = async (url: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(url, { cache: "no-store", signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "ok") return data;
          }
        } catch (e) {
          clearTimeout(timeoutId);
        }
        throw new Error("Failed");
      };

      try {
        fetchedData = await Promise.any(endpoints.map(ep => fetchEndpoint(ep)));
      } catch (e) {
        // Fallback to fileInfo if getToken is slow
        try {
          const infoRes = await fetch(`/api/fileInfo/${fileId}`, { cache: "no-store" });
          if (infoRes.ok) {
            const infoData = await infoRes.json();
            if (infoData.status === "ok" && infoData.data) {
              fetchedData = {
                file_id: fileId,
                name: infoData.data.name,
                size: infoData.data.size,
                download_path: `/download/${fileId}/${encodeURIComponent(infoData.data.name || "download")}`,
                token: fileId
              };
            }
          }
        } catch (err) {}
      }

      if (fetchedData) {
        const directDownloadUrl = fetchedData.download_url || (fetchedData.download_path ? `https://dl.ybxanime.com${fetchedData.download_path}` : "");
        
        setFile({
          id: fileId || "",
          name: fetchedData.name || "Download File",
          size: fetchedData.size || 0,
          downloadPath: fetchedData.download_path,
          downloadUrl: directDownloadUrl,
          token: fetchedData.token || fileId
        });
      } else {
        setError("The file you're looking for doesn't exist or has been removed.");
      }

      setLoading(false);
    }

    loadData();
    return () => { isMounted = false; };
  }, [fileId]);

  const handleDownload = () => {
    if (!file?.downloadPath) return;
    window.location.href = file.downloadPath;
  };

  const handleCopyLink = () => {
    if (!file?.downloadUrl) return;
    navigator.clipboard.writeText(file.downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060919]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">Preparing Download...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060919] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#0a0f24]/90 border border-red-500/20 max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">File Not Found</h2>
          <p className="text-slate-400 text-sm">
            {error || "The file you're looking for doesn't exist or has been removed."}
          </p>
        </motion.div>
      </div>
    );
  }

  const colors = getFileColor(file.name);
  const ext = getFileExtension(file.name);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-[#060919] p-4 relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Main Card */}
        <div className={`relative rounded-3xl bg-[#0a0f24]/95 backdrop-blur-2xl border ${colors.border} shadow-2xl ${colors.glow} overflow-hidden`}>
          
          {/* Top Accent Neon Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="p-7 md:p-9 flex flex-col items-center gap-6">
            
            {/* File Icon Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className={`w-20 h-20 rounded-2xl bg-[#0d1230] border ${colors.border} flex items-center justify-center shadow-lg ${colors.glow}`}>
                {getFileIcon(file.name)}
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-[#0d1230] border border-white/10 text-[10px] font-bold text-cyan-300 tracking-wider shadow">
                {ext}
              </div>
            </motion.div>

            {/* File Name */}
            <div className="text-center w-full">
              <h1 className="text-lg font-bold text-white leading-snug break-all px-2">
                {file.name}
              </h1>
            </div>

            {/* File Stats */}
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-200">{formatBytes(file.size)}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Fast CDN</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3 pt-2">
              {/* Primary Direct Download Button */}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={file.downloadUrl || file.downloadPath}
                download={file.name}
                className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${colors.btn} text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl ${colors.glow} transition-all duration-200 focus:outline-none focus:ring-2 ${colors.ring} select-none cursor-pointer text-center no-underline`}
              >
                <Download className="w-5 h-5" />
                Download Now
              </motion.a>

              {/* Copy Link Button for IDM / 1DM / ADM */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-5 rounded-2xl bg-[#0e1433] hover:bg-[#131b45] border border-slate-700/60 text-slate-300 hover:text-white text-xs md:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Copy Link (for IDM / 1DM / ADM)</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer Powered By */}
            <div className="w-full pt-3 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 tracking-wider">
                Powered by YBX Drive
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#060919]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
