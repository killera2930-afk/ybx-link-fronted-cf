// src/components/modals/FolderUploadModal.tsx
import { X, FolderUp, FolderTree, Files, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface FolderUploadModalProps {
  fileCount: number;
  defaultFolderName: string;
  onClose: () => void;
  onUpload: (folderName: string, flattenStructure: boolean) => void;
}

export default function FolderUploadModal({ 
  fileCount, 
  defaultFolderName, 
  onClose, 
  onUpload 
}: FolderUploadModalProps) {
  const [folderName, setFolderName] = useState(defaultFolderName);
  const [keepStructure, setKeepStructure] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onUpload(folderName.trim(), !keepStructure);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/40 via-cyan-500/30 to-violet-500/30 shadow-2xl shadow-emerald-500/10"
      >
        <div className="cyber-glass bg-[#080d24]/95 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FolderUp size={18} />
              </div>
              <span>Upload Entire Folder</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors">
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* File Count Info */}
            <div className="bg-[#0e163b] border border-emerald-500/25 rounded-2xl p-3 flex gap-3 items-center">
              <Files size={18} className="text-emerald-400 shrink-0" />
              <p className="text-xs font-semibold text-emerald-200">
                {fileCount} file{fileCount !== 1 ? 's' : ''} detected ready for batch upload
              </p>
            </div>

            {/* Folder Name Input */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">Destination Folder Name</label>
              <input
                autoFocus
                type="text"
                className="w-full bg-[#050814] border border-slate-800 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />
            </div>

            {/* Upload Options */}
            <div className="space-y-2 pt-1">
              <label className="text-xs text-slate-400 font-semibold block">Hierarchy Mode</label>
              
              <div 
                onClick={() => setKeepStructure(true)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  keepStructure 
                    ? "bg-emerald-950/30 border-emerald-400/80 shadow-md shadow-emerald-500/10" 
                    : "bg-[#050814] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="mt-0.5">
                  {keepStructure ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Preserve Subfolder Tree</span>
                  <span className="text-[11px] text-slate-400">Maintains exact nested folder structure inside TG Drive</span>
                </div>
              </div>

              <div 
                onClick={() => setKeepStructure(false)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  !keepStructure 
                    ? "bg-emerald-950/30 border-emerald-400/80 shadow-md shadow-emerald-500/10" 
                    : "bg-[#050814] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="mt-0.5">
                  {!keepStructure ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Flatten into Single Folder</span>
                  <span className="text-[11px] text-slate-400">Places all nested files inside the root folder directly</span>
                </div>
              </div>
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
                disabled={!folderName.trim()}
                className="shimmer-btn flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                Start Folder Upload
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
