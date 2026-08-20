// src/components/modals/ImageViewer.tsx
import { X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCw, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((prev) => Math.min(prev + 0.25, 3));
      if (e.key === "-" || e.key === "_") setZoom((prev) => Math.max(prev - 0.25, 0.5));
      if (e.key === "0") { setZoom(1); setRotation(0); }
      if (e.key === "r" || e.key === "R") setRotation((prev) => (prev + 90) % 360);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      {/* Top Floating Action Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
        <div className="bg-[#090e24]/90 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl pointer-events-auto max-w-sm">
          <p className="text-xs font-bold text-white truncate" title={alt}>
            {alt}
          </p>
          <span className="text-[10px] text-pink-400 font-semibold font-mono">
            {Math.round(zoom * 100)}% • {rotation}°
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 bg-[#090e24]/90 border border-white/10 backdrop-blur-xl p-1.5 rounded-2xl pointer-events-auto shadow-2xl">
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Zoom In (+)"
          >
            <ZoomIn size={16} />
          </button>

          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Zoom Out (-)"
          >
            <ZoomOut size={16} />
          </button>

          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Rotate 90° (R)"
          >
            <RotateCw size={16} />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all"
            title="Copy Image URL"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-all"
            title="Download Image"
          >
            <Download size={16} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <div className="w-[1px] h-5 bg-white/10 mx-1" />

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-red-600 rounded-xl transition-all"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main Image Container */}
      {!error && (
        <div 
          className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            className={`max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-300 select-none shadow-2xl rounded-2xl ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center p-6 bg-[#0c122c] border border-red-800 rounded-3xl">
          <h3 className="text-lg font-bold text-red-400 mb-2">Image Failed to Load</h3>
          <p className="text-xs text-slate-400 mb-4">The file could not be rendered.</p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
