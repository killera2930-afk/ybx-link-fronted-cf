// src/components/bulk/BulkActions.tsx
import { Download, Trash2, X, CheckSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileItem } from "@/lib/types";

interface BulkActionsProps {
  selectedItems: FileItem[];
  onDeselectAll: () => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onBulkMove?: () => void;
}

export default function BulkActions({
  selectedItems,
  onDeselectAll,
  onBulkDownload,
  onBulkDelete,
}: BulkActionsProps) {
  const selectedCount = selectedItems.length;
  const totalSize = selectedItems
    .filter(item => item.type === "file")
    .reduce((sum, item) => sum + (item.size || 0), 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 shadow-2xl shadow-cyan-500/30"
      >
        <div className="cyber-glass bg-[#080d24]/95 rounded-3xl p-3 sm:px-5 sm:py-3.5 flex items-center gap-3 sm:gap-6 min-w-[300px] sm:min-w-[440px]">
          
          {/* Selected Count Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <CheckSquare size={18} />
            </div>
            <div>
              <div className="text-white text-xs sm:text-sm font-bold">
                {selectedCount} Selected
              </div>
              {totalSize > 0 && (
                <div className="text-[10px] text-cyan-300 font-mono">
                  {formatSize(totalSize)}
                </div>
              )}
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={onBulkDownload}
              className="shimmer-btn flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Download size={14} />
              <span>Download All</span>
            </button>

            <button
              onClick={onBulkDelete}
              className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-300 rounded-xl transition-all active:scale-95"
              title="Delete Selected"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={onDeselectAll}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition-colors"
              title="Deselect All"
            >
              <X size={16} />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
