// src/components/modals/QRCodeModal.tsx
import { X, QrCode, Copy, Check, ExternalLink, Smartphone } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface QRCodeModalProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

export default function QRCodeModal({ url, fileName, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=080d24&color=38bdf8&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm p-[1px] rounded-3xl bg-gradient-to-b from-cyan-500/40 via-violet-500/30 to-pink-500/30 shadow-2xl shadow-cyan-500/20"
      >
        <div className="cyber-glass bg-[#080d24]/95 rounded-3xl p-6 relative overflow-hidden text-center">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <QrCode size={24} />
          </div>

          <h2 className="text-lg font-bold text-white mb-1">Scan & Download</h2>
          <p className="text-xs text-slate-400 truncate px-4 mb-4" title={fileName}>
            {fileName}
          </p>

          {/* QR Code Container */}
          <div className="p-3 bg-[#050814] border border-cyan-500/30 rounded-2xl inline-block shadow-inner mb-4 relative group">
            <img
              src={qrImageUrl}
              alt="QR Code"
              className="w-48 h-48 rounded-xl object-contain mx-auto"
            />
            <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-cyan-400 font-medium mb-5">
            <Smartphone size={14} />
            <span>Scan with phone camera for instant mobile download</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <ExternalLink size={14} />
              <span>Open</span>
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
