// src/components/modals/RemoteUploadModal.tsx
import { X, Link2, DownloadCloud, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface RemoteUploadModalProps {
  onClose: () => void;
  onUpload: (url: string) => void;
}

export default function RemoteUploadModal({ onClose, onUpload }: RemoteUploadModalProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUpload(url.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg p-[1px] rounded-3xl bg-gradient-to-b from-pink-500/40 via-violet-500/30 to-cyan-500/30 shadow-2xl shadow-pink-500/10"
      >
        <div className="cyber-glass bg-[#080d24]/95 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Link2 size={18} />
              </div>
              <span>Remote URL Upload</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors">
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">Direct Download Link</label>
              <input
                autoFocus
                type="url"
                placeholder="https://example.com/movie.mp4 or direct file URL"
                className="w-full bg-[#050814] border border-slate-800 focus:border-pink-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="bg-[#0e163b] border border-cyan-500/25 rounded-2xl p-3.5 flex gap-3 items-start">
              <DownloadCloud size={20} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-200/90 leading-relaxed">
                The high-speed VPS backend will download the file directly and mirror it to your Telegram storage channels in the background.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!url.trim()}
                className="shimmer-btn flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all disabled:opacity-50"
              >
                Start Background Fetch
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
