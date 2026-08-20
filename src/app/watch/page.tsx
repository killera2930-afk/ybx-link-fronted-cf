// src/app/watch/page.tsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Film, ArrowLeft, Download } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://dl.ybxanime.com";

function WatchContent() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("path") || searchParams.get("id") || searchParams.get("token") || searchParams.get("file_id");
  
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setError("No file ID or path provided.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadInfo() {
      const endpoints = [
        `/api/fileInfo/${fileId}`,
        `${BACKEND_URL}/api/fileInfo/${fileId}`
      ];

      const fetchEndpoint = async (url: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        try {
          const res = await fetch(url, { cache: "no-store", signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "ok") return data.data;
          }
        } catch (e) {
          clearTimeout(timeoutId);
        }
        throw new Error("Failed");
      };

      try {
        const result = await Promise.any(endpoints.map(ep => fetchEndpoint(ep)));
        if (isMounted) {
          setFile(result);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setFile({ name: "Video Stream", size: 0 });
          setLoading(false);
        }
      }
    }

    loadInfo();
    return () => { isMounted = false; };
  }, [fileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060919]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !fileId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060919] p-4">
        <div className="p-8 rounded-3xl bg-[#0a0f24]/90 border border-red-500/20 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Stream Error</h2>
          <p className="text-slate-400 text-sm">{error || "Unable to load stream."}</p>
        </div>
      </div>
    );
  }

  const streamUrl = `/view/${fileId || ""}`;
  const downloadUrl = `/download?path=${fileId || ""}`;

  return (
    <div className="min-h-screen bg-[#060919] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-[#0a0f24]/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={downloadUrl} className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-base truncate max-w-xs md:max-w-md">
              {file?.name || "YBX Player"}
            </span>
          </div>
        </div>
        <Link 
          href={downloadUrl}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs md:text-sm flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Download className="w-4 h-4" />
          Download
        </Link>
      </header>

      {/* Video Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black/90 border border-slate-800 shadow-2xl relative">
          <video 
            src={streamUrl} 
            controls 
            autoPlay 
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </main>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#060919]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
