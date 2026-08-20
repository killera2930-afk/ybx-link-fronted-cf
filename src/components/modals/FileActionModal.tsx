// src/components/modals/FileActionModal.tsx
import { 
  X, Download, Copy, Play, FileText, Film, Image as ImageIcon, 
  Check, ExternalLink, Shield, Maximize2, QrCode, Code2, Sparkles, Music
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile, isImageFile } from "@/lib/utils";
import { useState } from "react";
import { getFileUrls } from "@/lib/api";
import QRCodeModal from "./QRCodeModal";

interface FileActionModalProps {
  file: FileItem;
  onClose: () => void;
  onStream?: () => void;
  onViewImage?: () => void;
  onPlayAudio?: () => void;
}

export default function FileActionModal({ 
  file, 
  onClose, 
  onStream, 
  onViewImage,
  onPlayAudio 
}: FileActionModalProps) {
  const isVideo = isVideoFile(file.name);
  const isImage = isImageFile(file.name);
  const isAudio = Boolean(file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i));
  
  const { directUrl, streamUrl, downloadUrl, vercelUrl } = getFileUrls(file.id);
  
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "embed">("links");

  const copyToClipboard = (text: string, type: 'vercel' | 'embed') => {
    navigator.clipboard.writeText(text);
    if (type === 'vercel') {
      setCopiedVercel(true);
      setTimeout(() => setCopiedVercel(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  const getEmbedCode = () => {
    if (isVideo) {
      return `<video controls width="100%" src="${streamUrl}" poster="">Your browser does not support video.</video>`;
    }
    if (isImage) {
      return `![${file.name}](${streamUrl})`;
    }
    if (isAudio) {
      return `<audio controls src="${streamUrl}"></audio>`;
    }
    return `<a href="${downloadUrl}" target="_blank">${file.name}</a>`;
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg p-[1px] rounded-3xl bg-gradient-to-b from-cyan-500/40 via-violet-500/30 to-pink-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden"
        >
          <div className="cyber-glass bg-[#080d24]/95 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header & Media Preview */}
            <div className="relative bg-[#050814] flex flex-col items-center justify-center border-b border-white/[0.08] p-6">
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#0c122c] hover:bg-[#151f47] border border-white/10 rounded-full transition-all z-20"
              >
                <X size={16} />
              </button>

              {/* Media Icon / Preview */}
              <div className="w-full flex items-center justify-center">
                {isImage ? (
                  <div className="relative group max-h-[220px] rounded-xl overflow-hidden shadow-lg border border-pink-500/30">
                    <img 
                      src={directUrl}
                      alt={file.name}
                      className="max-w-full max-h-[220px] object-contain rounded-xl cursor-pointer"
                      onClick={onViewImage}
                    />
                    <div 
                      onClick={onViewImage}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer gap-2 text-white text-xs font-bold"
                    >
                      <Maximize2 size={18} />
                      <span>Full View</span>
                    </div>
                  </div>
                ) : isVideo ? (
                  <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <Film size={40} />
                  </div>
                ) : isAudio ? (
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <Music size={40} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <FileText size={40} />
                  </div>
                )}
              </div>

              {/* Title & Size */}
              <div className="text-center mt-4 space-y-1 w-full px-4">
                <h2 className="text-sm sm:text-base font-bold text-white truncate" title={file.name}>
                  {file.name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="bg-[#0e163b] text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-semibold font-mono">
                    {formatBytes(file.size || 0)}
                  </span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-slate-300">
                    {file.name.split('.').pop() || "FILE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body & Action Tabs */}
            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Quick Stream & View Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {isVideo && onStream && (
                  <button 
                    onClick={() => { onClose(); onStream(); }}
                    className="col-span-2 shimmer-btn flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-[0.98]"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>Cinema Stream</span>
                  </button>
                )}

                {isAudio && onPlayAudio && (
                  <button 
                    onClick={() => { onClose(); onPlayAudio(); }}
                    className="col-span-2 shimmer-btn flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all active:scale-[0.98]"
                  >
                    <Music size={18} />
                    <span>Play Audio Track</span>
                  </button>
                )}

                {isImage && onViewImage && (
                  <button 
                    onClick={() => { onClose(); onViewImage(); }}
                    className="col-span-2 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/30 transition-all active:scale-[0.98]"
                  >
                    <Maximize2 size={18} />
                    <span>View HD Image</span>
                  </button>
                )}
              </div>

              {/* Tabs Switcher */}
              <div className="flex bg-[#060918] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("links")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "links" 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Download & Share
                </button>
                <button
                  onClick={() => setActiveTab("embed")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "embed" 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Embed & Codes
                </button>
              </div>

              {activeTab === "links" ? (
                <div className="space-y-3">
                  {/* Primary Download Button */}
                  <div className="flex gap-2">
                    <a 
                      href={downloadUrl}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="shimmer-btn flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
                    >
                      <Download size={18} />
                      <span>Download File</span>
                    </a>

                    <button
                      onClick={() => setShowQR(true)}
                      className="p-3 bg-[#0f1738] hover:bg-[#182352] border border-cyan-500/30 text-cyan-400 rounded-xl transition-all"
                      title="Generate Mobile QR Code"
                    >
                      <QrCode size={18} />
                    </button>
                  </div>

                  {/* Copy Link Input Bar */}
                  <div className="flex items-center gap-2 bg-[#060918] border border-slate-800 rounded-xl p-1.5">
                    <input 
                      type="text" 
                      readOnly 
                      value={downloadUrl} 
                      className="flex-1 bg-transparent px-2.5 text-xs text-slate-300 font-mono outline-none truncate" 
                    />
                    <button
                      onClick={() => copyToClipboard(downloadUrl, "vercel")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        copiedVercel 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                            : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      {copiedVercel ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedVercel ? "Copied" : "Copy Link"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Copy pre-formatted code to embed this file in your blog, website, or markdown:</p>
                  <div className="bg-[#050814] border border-slate-800 rounded-xl p-2.5 relative group">
                    <pre className="text-[11px] font-mono text-cyan-300 whitespace-pre-wrap break-all pr-12">
                      {getEmbedCode()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getEmbedCode(), "embed")}
                      className="absolute top-2 right-2 p-1.5 bg-[#0c122c] hover:bg-[#151f47] border border-cyan-500/30 text-cyan-400 rounded-lg transition-all"
                      title="Copy Embed Code"
                    >
                      {copiedEmbed ? <Check size={14} className="text-emerald-400" /> : <Code2 size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* View in New Tab */}
              <div className="pt-2 border-t border-white/[0.05] text-center">
                <a 
                  href={streamUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink size={12} /> Open in Raw Browser Tab
                </a>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* QR Code Popup */}
      <AnimatePresence>
        {showQR && (
          <QRCodeModal
            url={downloadUrl}
            fileName={file.name}
            onClose={() => setShowQR(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
